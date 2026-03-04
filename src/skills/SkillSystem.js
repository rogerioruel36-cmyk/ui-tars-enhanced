/**
 * Skill System Framework
 * Implements skill loader, dependency resolution, and hot reload
 */
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class SkillLoader extends EventEmitter {
  constructor(options = {}) {
    super();
    this.skills = new Map();
    this.skillsDir = options.skillsDir || path.join(process.cwd(), 'skills');
    this.loadedSkills = new Map();
    this.watchers = new Map();
    this.watchEnabled = options.watchEnabled !== false;
  }

  /**
   * Load a skill from a directory or npm package
   */
  async load(skillPath, options = {}) {
    const { name, version, config = {} } = options;

    try {
      let skillModule;

      // Check if it's a local path
      if (fs.existsSync(skillPath)) {
        const entryFile = path.join(skillPath, 'index.js');
        if (fs.existsSync(entryFile)) {
          skillModule = require(entryFile);
        } else {
          throw new Error(`Skill entry file not found: ${entryFile}`);
        }
      } else {
        // Try loading as npm package
        skillModule = require(skillPath);
      }

      // Get skill handler
      const handler = skillModule.default || skillModule.handler || skillModule;
      const metadata = skillModule.metadata || { name, version };

      const skill = {
        name: metadata.name || name,
        version: metadata.version || version,
        handler,
        config,
        path: skillPath,
        loadedAt: new Date().toISOString()
      };

      this.skills.set(skill.name, skill);
      this.loadedSkills.set(skill.name, skill);

      // Setup hot reload watcher if enabled
      if (this.watchEnabled && fs.existsSync(skillPath)) {
        this.setupWatcher(skill.name, skillPath);
      }

      this.emit('loaded', skill);
      return skill;
    } catch (error) {
      this.emit('error', { skill: name, error: error.message });
      throw error;
    }
  }

  /**
   * Load multiple skills
   */
  async loadMany(skillConfigs) {
    const results = [];
    for (const config of skillConfigs) {
      const skill = await this.load(config.path || config.name, config);
      results.push(skill);
    }
    return results;
  }

  /**
   * Load all skills from the skills directory
   */
  async loadAll() {
    if (!fs.existsSync(this.skillsDir)) {
      console.log(`Skills directory not found: ${this.skillsDir}`);
      return [];
    }

    const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });
    const skillDirs = entries.filter(e => e.isDirectory());

    const results = [];
    for (const dir of skillDirs) {
      try {
        const skillPath = path.join(this.skillsDir, dir.name);
        const configPath = path.join(skillPath, 'skill.json');
        let config = { name: dir.name, version: '1.0.0' };

        if (fs.existsSync(configPath)) {
          config = { ...config, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
        }

        const skill = await this.load(skillPath, config);
        results.push(skill);
      } catch (error) {
        console.error(`Failed to load skill ${dir.name}:`, error.message);
      }
    }

    return results;
  }

  /**
   * Get a loaded skill
   */
  get(name) {
    return this.skills.get(name);
  }

  /**
   * Get all loaded skills
   */
  getAll() {
    return Array.from(this.skills.values());
  }

  /**
   * Unload a skill
   */
  unload(name) {
    const skill = this.skills.get(name);
    if (skill) {
      this.skills.delete(name);
      this.loadedSkills.delete(name);
      this.removeWatcher(name);
      this.emit('unloaded', skill);
    }
  }

  /**
   * Reload a skill (hot reload)
   */
  async reload(name) {
    const skill = this.loadedSkills.get(name);
    if (!skill) {
      throw new Error(`Skill not loaded: ${name}`);
    }

    // Remove old watcher
    this.removeWatcher(name);

    // Clear require cache
    const entryPath = path.join(skill.path, 'index.js');
    delete require.cache[require.resolve(entryPath)];

    // Reload skill
    return await this.load(skill.path, { name: skill.name, version: skill.version, config: skill.config });
  }

  /**
   * Setup file watcher for hot reload
   */
  setupWatcher(skillName, skillPath) {
    if (this.watchers.has(skillName)) return;

    try {
      const chokidar = require('chokidar') || null;

      if (chokidar) {
        const watcher = chokidar.watch(path.join(skillPath, '**/*.js'), {
          ignored: /node_modules/,
          persistent: true
        });

        watcher.on('change', async (filePath) => {
          console.log(`[Skill System] Detected change in ${skillName}: ${path.basename(filePath)}`);
          try {
            await this.reload(skillName);
            this.emit('reloaded', { name: skillName, file: filePath });
          } catch (error) {
            this.emit('error', { skill: skillName, error: error.message });
          }
        });

        this.watchers.set(skillName, watcher);
      }
    } catch (error) {
      // chokidar not available, skip hot reload
      console.log('[Skill System] Hot reload not available (chokidar not installed)');
    }
  }

  /**
   * Remove file watcher
   */
  removeWatcher(skillName) {
    const watcher = this.watchers.get(skillName);
    if (watcher) {
      watcher.close();
      this.watchers.delete(skillName);
    }
  }

  /**
   * Close all watchers
   */
  close() {
    for (const [name, watcher] of this.watchers) {
      watcher.close();
    }
    this.watchers.clear();
  }
}

/**
 * Dependency Resolver for skills
 */
class DependencyResolver {
  constructor() {
    this.resolved = new Map();
  }

  /**
   * Resolve skill dependencies
   */
  resolve(skill, allSkills) {
    const resolved = [];
    const visiting = new Set();

    const resolve = (skillName) => {
      if (resolved.includes(skillName)) return;
      if (visiting.has(skillName)) {
        throw new Error(`Circular dependency detected: ${skillName}`);
      }

      visiting.add(skillName);

      const skillConfig = allSkills.find(s => s.name === skillName);
      if (!skillConfig) {
        throw new Error(`Skill not found: ${skillName}`);
      }

      const deps = skillConfig.dependencies || [];
      for (const dep of deps) {
        resolve(dep);
      }

      visiting.delete(skillName);
      resolved.push(skillName);
    };

    if (skill.dependencies) {
      for (const dep of skill.dependencies) {
        resolve(dep);
      }
    }

    return resolved;
  }

  /**
   * Topological sort for skill loading order
   */
  topologicalSort(skills) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (skill) => {
      if (visited.has(skill.name)) return;
      if (visiting.has(skill.name)) {
        throw new Error(`Circular dependency: ${skill.name}`);
      }

      visiting.add(skill.name);

      const deps = skill.dependencies || [];
      for (const depName of deps) {
        const dep = skills.find(s => s.name === depName);
        if (dep) visit(dep);
      }

      visiting.delete(skill.name);
      visited.add(skill.name);
      sorted.push(skill);
    };

    for (const skill of skills) {
      visit(skill);
    }

    return sorted;
  }
}

module.exports = { SkillLoader, DependencyResolver };

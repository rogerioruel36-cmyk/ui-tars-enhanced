#!/usr/bin/env node
/**
 * Workflow Schema Validator
 * Validates workflow JSON files against the UI-TARS workflow schema
 */
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'workflow.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false, formats: 'ajv' });
const validate = ajv.compile(schema);

function validateWorkflow(filePath) {
  try {
    const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(workflow);

    if (valid) {
      console.log(`✓ ${filePath}: Valid workflow`);
      return true;
    } else {
      console.log(`✗ ${filePath}: Invalid workflow`);
      validate.errors.forEach(err => {
        console.log(`  - ${err.instancePath}: ${err.message}`);
      });
      return false;
    }
  } catch (err) {
    console.log(`✗ ${filePath}: Error - ${err.message}`);
    return false;
  }
}

// Validate example workflow
const workflowsDir = path.join(__dirname, '..', 'workflows');
const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));

if (files.length === 0) {
  console.log('No workflow files found in workflows/');
  process.exit(1);
}

let allValid = true;
files.forEach(file => {
  if (!validateWorkflow(path.join(workflowsDir, file))) {
    allValid = false;
  }
});

process.exit(allValid ? 0 : 1);

/**
 * Data Extractor Skill
 * Extracts structured data from web pages
 */

const metadata = {
  name: 'data-extractor',
  version: '1.0.0',
  description: 'Extract structured data from web pages',
  parameters: {
    selector: { type: 'string', required: true, description: 'CSS selector for elements' },
    fields: { type: 'array', required: false, description: 'Fields to extract from each element' },
    attribute: { type: 'string', required: false, description: 'Attribute to extract' }
  }
};

/**
 * Extract data from current page
 * @param {Object} params - Skill parameters
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} Extracted data
 */
async function handler(params, context) {
  const { page } = context;
  const { selector, fields = [], attribute } = params;

  if (!page) {
    throw new Error('Page context required');
  }

  // Get all matching elements
  const elements = await page.$$(selector);

  if (elements.length === 0) {
    return { extracted: 0, data: [] };
  }

  const results = [];

  for (const el of elements) {
    let item = {};

    if (fields.length > 0) {
      // Extract specific fields
      for (const field of fields) {
        const value = await el.evaluate((el, f) => {
          const target = el.querySelector(f);
          return target ? target.textContent.trim() : null;
        }, field);
        item[field] = value;
      }
    } else if (attribute) {
      // Extract single attribute
      item = await el.evaluate((el, attr) => el.getAttribute(attr), attribute);
    } else {
      // Extract text content
      item = await el.evaluate(el => el.textContent.trim());
    }

    results.push(item);
  }

  return {
    extracted: results.length,
    data: results
  };
}

module.exports = { handler, metadata };

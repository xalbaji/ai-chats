const test = require('node:test');
const assert = require('node:assert/strict');
const { isImageGenerationRequest, isImageEnhancementRequest } = require('./chatService');

test('detects image generation prompts', () => {
  assert.equal(isImageGenerationRequest('Generate an image of a neon city'), true);
  assert.equal(isImageGenerationRequest('Draw a photo of a mountain sunset'), true);
  assert.equal(isImageGenerationRequest('Create a picture of a dog in a field'), true);
  assert.equal(isImageGenerationRequest('Now add a bowtie on the cat'), true);
  assert.equal(isImageGenerationRequest('Summarize this codebase'), false);
});

test('detects uploaded image enhancement prompts', () => {
  assert.equal(isImageEnhancementRequest('Enhance the quality of this picture'), true);
  assert.equal(isImageEnhancementRequest('Improve this image'), true);
  assert.equal(isImageEnhancementRequest('Summarize this photo'), false);
});

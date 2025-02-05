import {
  type FeatureExtractionPipeline,
  pipeline,
  TokenClassificationOutput,
  TokenClassificationPipeline,
} from "@huggingface/transformers";

async function main() {
  const classifier = await pipeline(
    "text-classification",
    "onnxport/distilbert-base-uncased-onnx"
  );

  const result = await classifier("What is the capital of France? Paris");
  console.log(result);
}

main();

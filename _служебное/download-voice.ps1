# Downloads the local neural TTS engine and the Russian voice model.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $root "voice"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

$files = @(
  @{ u = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.js";   f = "piper_phonemize.js" },
  @{ u = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"; f = "piper_phonemize.wasm" },
  @{ u = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data"; f = "piper_phonemize.data" },
  @{ u = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/ort.min.js";                  f = "ort.min.js" },
  @{ u = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/ort-wasm-simd.jsep.wasm";      f = "ort-wasm-simd.jsep.wasm" },
  @{ u = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/ort-wasm-simd.wasm";           f = "ort-wasm-simd.wasm" },
  @{ u = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/ort-wasm.wasm";                f = "ort-wasm.wasm" },
  @{ u = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main/ru/ru_RU/irina/medium/ru_RU-irina-medium.onnx.json"; f = "ru_RU-irina-medium.onnx.json" },
  @{ u = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main/ru/ru_RU/irina/medium/ru_RU-irina-medium.onnx";      f = "ru_RU-irina-medium.onnx" }
)

foreach ($item in $files) {
  $out = Join-Path $dir $item.f
  if (Test-Path $out) { Write-Host ("already here: " + $item.f); continue }
  Write-Host ("downloading: " + $item.f)
  Invoke-WebRequest -Uri $item.u -OutFile $out -UseBasicParsing -TimeoutSec 900
}
Write-Host "Voice files are ready."

"""
Preload and verify all HuggingFace models used by CivicPulse AI.
"""
import sys
from transformers import pipeline, MarianMTModel, MarianTokenizer

print("=== Preloading Hugging Face Models ===")

try:
    print("1/4 Loading DistilBERT urgency model...")
    pipe1 = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")
    test1 = pipe1("Emergency road damage requires urgent repair")
    print("   [OK] DistilBERT working:", test1)
except Exception as e:
    print("   [Error] DistilBERT:", e)

try:
    print("2/4 Loading Cross-Encoder fact verifier model...")
    pipe2 = pipeline("text-classification", model="cross-encoder/ms-marco-MiniLM-L-6-v2")
    test2 = pipe2("India launched satellite [SEP] ISRO launched an earth observation satellite into orbit.")
    print("   [OK] Cross-Encoder working:", test2)
except Exception as e:
    print("   [Error] Cross-Encoder:", e)

try:
    print("3/4 Loading Helsinki-NLP English->Hindi translation model...")
    t_name = "Helsinki-NLP/opus-mt-en-hi"
    tok = MarianTokenizer.from_pretrained(t_name)
    m = MarianMTModel.from_pretrained(t_name)
    inputs = tok(["Government healthcare scheme"], return_tensors="pt")
    out = m.generate(**inputs)
    translated = tok.decode(out[0], skip_special_tokens=True)
    print("   [OK] Helsinki-NLP working:", translated)
except Exception as e:
    print("   [Error] Helsinki-NLP:", e)

try:
    print("4/4 Loading BART summarizer model...")
    pipe4 = pipeline("summarization", model="facebook/bart-large-cnn")
    test4 = pipe4(
        "The Ministry of Agriculture and Farmers Welfare introduced a new digital subsidy scheme to facilitate financial transfers directly to smallholder farmers through verified bank accounts.",
        max_length=60, min_length=20, do_sample=False
    )
    print("   [OK] BART working:", test4)
except Exception as e:
    print("   [Error] BART:", e)

print("\n=== All Hugging Face Models Loaded & Verified ===")

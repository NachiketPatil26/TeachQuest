#!/usr/bin/env python3
import argparse
import json
import sys
import os
import requests
from typing import Dict, Any

# Simple in-memory cache for common queries
_response_cache = {}
_cache_size_limit = 100  # Maximum number of items to keep in cache

def call_ollama_api(prompt: str, system_prompt: str, model_name: str = "deepseek-r1:1.5b", max_tokens: int = 1024) -> str:
    """Call the Ollama API to generate a response using the Deepseek R1 model."""
    # Generate a cache key from the prompt and system prompt
    cache_key = f"{prompt}::{system_prompt}::{model_name}::{max_tokens}"
    
    # Check if we have a cached response
    if cache_key in _response_cache:
        return _response_cache[cache_key]
    
    try:
        # Fast health check with short timeout
        try:
            health_check = requests.get("http://localhost:11434/api/version", timeout=1)
            if health_check.status_code != 200:
                raise requests.exceptions.RequestException("Ollama service is not running or not responding")
        except requests.exceptions.RequestException:
            print("Ollama service is not running or not accessible", file=sys.stderr)
            return json.dumps({
                "intent": "error",
                "message": "AI service is currently unavailable",
                "suggestion": "Please try again later or contact system administrator"
            })
        
        # Ollama API endpoint
        url = "http://localhost:11434/api/generate"
        
        # Prepare the request payload with optimized settings
        payload = {
            "model": model_name,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.7,  # Lower temperature for faster responses
                "top_k": 40,         # Limit token selection for faster generation
                "top_p": 0.9         # Nucleus sampling for better speed/quality balance
            }
        }
        
        # Make the API request with reduced timeout
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse the response
        result = response.json()
        response_text = result.get("response", "")
        
        # For general chat, wrap the response in our expected JSON format
        if not response_text.startswith("{"):
            # Simplified thinking extraction - faster pattern matching
            thinking = ""
            message = response_text
            
            # Extract thinking if present using a simpler pattern match
            if "Thinking:" in response_text:
                try:
                    parts = response_text.split("Thinking:", 1)[1].split("\n\n", 1)
                    if len(parts) > 1:
                        thinking = parts[0].strip()
                        message = parts[1].strip()
                    else:
                        message = parts[0].strip()
                except IndexError:
                    # If splitting fails, use the original text
                    pass
                    
            response_json = json.dumps({
                "intent": "chat",
                "message": message,
                "thinking": thinking,
                "confidence": 0.95
            })
            
            # Cache the response before returning
            if len(_response_cache) >= _cache_size_limit:
                # Remove a random item if cache is full
                _response_cache.pop(next(iter(_response_cache)))
            _response_cache[cache_key] = response_json
            
            return response_json
            
        # Cache the response before returning
        if len(_response_cache) >= _cache_size_limit:
            # Remove a random item if cache is full
            _response_cache.pop(next(iter(_response_cache)))
        _response_cache[cache_key] = response_text
        
        return response_text
        
    except requests.exceptions.RequestException as e:
        print(f"Error calling Ollama API: {str(e)}", file=sys.stderr)
        # Return a structured error response instead of raising an exception
        return json.dumps({
            "intent": "error",
            "message": f"Error connecting to Ollama API: {str(e)}",
            "suggestion": "Please check if Ollama is running and the model is available"
        })

def parse_args():
    parser = argparse.ArgumentParser(description="Run Deepseek R1 model via Ollama for TeachQuest")
    parser.add_argument("--prompt", type=str, required=True, help="JSON string with system and user prompts")
    parser.add_argument("--model", type=str, default="deepseek-r1", help="Model name in Ollama")
    parser.add_argument("--max-tokens", type=int, default=1024, help="Maximum tokens to generate")
    return parser.parse_args()

def main():
    args = parse_args()
    
    try:
        # Parse the prompt JSON
        prompt_data = json.loads(args.prompt)
        system_prompt = prompt_data.get("system", "")
        user_prompt = prompt_data.get("user", "")
        
        # Call Ollama API
        response = call_ollama_api(
            prompt=user_prompt,
            system_prompt=system_prompt,
            model_name=args.model,
            max_tokens=args.max_tokens
        )
        
        # Try to parse the response as JSON
        try:
            # First, check if the response is already valid JSON
            json_response = json.loads(response)
            print(json.dumps(json_response))
        except json.JSONDecodeError:
            # If not valid JSON, try to extract JSON from the text response
            # This handles cases where the model might add explanatory text around the JSON
            import re
            json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
            if json_match:
                try:
                    json_str = json_match.group(1)
                    json_response = json.loads(json_str)
                    print(json.dumps(json_response))
                except json.JSONDecodeError:
                    # If JSON extraction fails, return a formatted error response
                    print(json.dumps({
                        "intent": "error",
                        "message": "Failed to parse model response as JSON",
                        "rawResponse": response
                    }))
            else:
                # If no JSON block found, return a formatted error response
                print(json.dumps({
                    "intent": "error",
                    "message": "Model did not return a valid JSON response",
                    "rawResponse": response
                }))
        
    except Exception as e:
        print(json.dumps({
            "intent": "error",
            "message": f"Error: {str(e)}",
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()

"""
Sentiment Analyzer Agent

This agent analyzes the sentiment and emotion in customer tickets, providing 
a detailed breakdown of customer emotions and overall tone.
"""

import re
import json
from typing import Dict, Any, List, Tuple

class SentimentAnalyzerAgent:
    """Agent that analyzes sentiment and emotions in customer support tickets."""
    
    def __init__(self):
        self.emotion_keywords = {
            "anger": ["angry", "furious", "annoyed", "irritated", "frustrated", "mad", "upset", "outraged"],
            "joy": ["happy", "pleased", "delighted", "satisfied", "excited", "glad", "grateful", "impressed"],
            "sadness": ["sad", "disappointed", "unhappy", "regret", "sorry", "depressed", "gloomy"],
            "fear": ["afraid", "worried", "concerned", "anxious", "nervous", "scared", "terrified"],
            "surprise": ["surprised", "shocked", "amazed", "astonished", "unexpected", "stunned"],
            "disgust": ["disgusted", "repulsed", "revolted", "dislike", "hate", "despise"],
            "confusion": ["confused", "perplexed", "bewildered", "unsure", "uncertain", "lost", "puzzled"],
            "urgency": ["urgent", "immediately", "asap", "critical", "emergency", "crucial", "deadline"],
            "trust": ["trust", "rely", "believe", "confidence", "faith", "assurance"],
        }
        
        self.sentiment_indicators = {
            "positive": ["love", "great", "excellent", "good", "best", "awesome", "fantastic", "wonderful", "helpful", "works", "solved", "fixed", "resolved", "thanks", "thank you", "appreciate"],
            "negative": ["bad", "terrible", "awful", "horrible", "useless", "problem", "issue", "error", "bug", "glitch", "doesn't work", "failed", "failure", "poor", "disappointed", "waste", "broken", "crash", "not working"],
            "neutral": ["how", "what", "when", "where", "who", "which", "question", "information", "help", "assist", "details", "instructions", "guidance", "explain", "tell", "show"]
        }
    
    def analyze_ticket(self, ticket: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a ticket's subject and description for sentiment and emotions."""
        text = f"{ticket['subject']} {ticket['description']}".lower()
        
        # Detect emotions
        emotions = self._detect_emotions(text)
        
        # Determine overall sentiment
        sentiment_scores = self._calculate_sentiment(text)
        primary_sentiment = max(sentiment_scores.items(), key=lambda x: x[1])[0]
        
        # Generate intensity score (0-1)
        intensity = self._calculate_intensity(emotions, text)
        
        # Analyze key phrases that indicate the sentiment
        key_phrases = self._extract_sentiment_phrases(text, primary_sentiment)
        
        return {
            "overall_sentiment": primary_sentiment,
            "sentiment_scores": sentiment_scores,
            "emotions": emotions,
            "intensity": intensity,
            "key_phrases": key_phrases,
            "summary": self._generate_summary(primary_sentiment, emotions, intensity)
        }
    
    def _detect_emotions(self, text: str) -> Dict[str, float]:
        """Detect emotions present in the text with scores."""
        emotions = {}
        
        for emotion, keywords in self.emotion_keywords.items():
            score = 0
            for keyword in keywords:
                # Look for whole words only
                matches = re.findall(r'\b' + keyword + r'\b', text)
                if matches:
                    # Weight increases with multiple occurrences
                    score += len(matches) * 0.2
            
            if score > 0:
                emotions[emotion] = min(1.0, score)  # Cap at 1.0
        
        # Normalize if we have any emotions
        if emotions:
            total = sum(emotions.values())
            # Only normalize if the total is greater than 1
            if total > 1:
                emotions = {k: v/total for k, v in emotions.items()}
                
        return emotions
    
    def _calculate_sentiment(self, text: str) -> Dict[str, float]:
        """Calculate sentiment scores (positive, negative, neutral)."""
        scores = {"positive": 0.0, "negative": 0.0, "neutral": 0.0}
        
        for sentiment, keywords in self.sentiment_indicators.items():
            for keyword in keywords:
                if keyword in text:
                    scores[sentiment] += 0.1
        
        # Normalize
        total = sum(scores.values())
        if total > 0:
            scores = {k: v/total for k, v in scores.items()}
            
        # Default to neutral if no clear sentiment
        if max(scores.values()) < 0.4:
            scores["neutral"] = max(scores["neutral"], 0.5)
            
        return scores
    
    def _calculate_intensity(self, emotions: Dict[str, float], text: str) -> float:
        """Calculate the intensity of emotion/sentiment in the text."""
        # Base intensity on:
        # 1. Presence of exclamation marks and ALL CAPS
        # 2. Strength of detected emotions
        # 3. Repetition of sentiment words
        
        intensity = 0.0
        
        # Check for exclamation marks
        exclamations = text.count('!')
        intensity += min(0.3, exclamations * 0.1)
        
        # Check for ALL CAPS words (sign of emphasis/shouting)
        words = text.split()
        caps_words = [w for w in words if w.isupper() and len(w) > 3]
        intensity += min(0.3, len(caps_words) * 0.05)
        
        # Factor in emotion strength
        if emotions:
            intensity += min(0.4, max(emotions.values()) * 0.4)
            
        return min(1.0, intensity)
    
    def _extract_sentiment_phrases(self, text: str, primary_sentiment: str) -> List[str]:
        """Extract key phrases that express the primary sentiment."""
        sentences = re.split(r'[.!?]+', text)
        key_phrases = []
        
        keywords = self.sentiment_indicators[primary_sentiment]
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Check if sentence contains any sentiment keywords
            if any(keyword in sentence.lower() for keyword in keywords):
                if len(sentence) > 100:
                    # Shorten long sentences
                    for keyword in keywords:
                        if keyword in sentence.lower():
                            start = max(0, sentence.lower().find(keyword) - 40)
                            end = min(len(sentence), sentence.lower().find(keyword) + 40)
                            phrase = sentence[start:end]
                            key_phrases.append(f"...{phrase}...")
                else:
                    key_phrases.append(sentence)
                    
            if len(key_phrases) >= 3:  # Limit to top 3 phrases
                break
                
        return key_phrases
    
    def _generate_summary(self, sentiment: str, emotions: Dict[str, float], intensity: float) -> str:
        """Generate a human-readable summary of the sentiment analysis."""
        # Format the intensity
        if intensity < 0.3:
            intensity_desc = "mild"
        elif intensity < 0.6:
            intensity_desc = "moderate"
        else:
            intensity_desc = "strong"
            
        # Get top emotions (max 2)
        top_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)[:2]
        emotion_text = ""
        
        if top_emotions:
            emotion_names = [e[0] for e in top_emotions]
            if len(emotion_names) == 1:
                emotion_text = f" with {emotion_names[0]}"
            else:
                emotion_text = f" with {emotion_names[0]} and {emotion_names[1]}"
                
        # Create summary
        if sentiment == "positive":
            return f"Customer exhibits {intensity_desc} positive sentiment{emotion_text}."
        elif sentiment == "negative":
            return f"Customer shows {intensity_desc} negative sentiment{emotion_text}."
        else:
            if emotion_text:
                return f"Customer has a neutral tone but displays {emotion_text}."
            else:
                return "Customer has a neutral and factual tone."

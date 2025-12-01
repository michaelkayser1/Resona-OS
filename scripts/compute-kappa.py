"""
QOTE Kappa Computation Engine
Calculates quantum coherence metrics for AI output analysis
Enhanced with real-time processing and web integration
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import Dict, List, Tuple, Optional
import json
import asyncio
import websockets
from datetime import datetime
import argparse
import sys
import os

class QOTEKappaComputer:
    def __init__(self, sensitivity: float = 0.75, threshold: float = 0.618):
        self.sensitivity = sensitivity
        self.threshold = threshold
        self.golden_ratio = 0.618033988749
        self.processing_history = []
        
    def compute_coherence_score(self, text: str, metadata: Optional[Dict] = None) -> Dict[str, float]:
        """
        Compute quantum coherence metrics for given text input
        Enhanced with metadata processing and historical tracking
        """
        if not text or not text.strip():
            return self._empty_result()
        
        # Tokenize and analyze text patterns
        tokens = self._preprocess_text(text)
        token_count = len(tokens)
        
        # Calculate base metrics
        entropy = self._calculate_entropy(tokens)
        stability = self._calculate_stability(tokens)
        resonance = self._calculate_resonance(tokens)
        
        complexity = self._calculate_complexity(tokens)
        coherence_variance = self._calculate_coherence_variance(tokens)
        
        # Apply quantum corrections
        coherence = self._apply_quantum_correction(entropy, stability, resonance, complexity)
        
        result = {
            'coherence': coherence,
            'stability': stability,
            'entropy': entropy,
            'resonance': resonance,
            'complexity': complexity,
            'coherence_variance': coherence_variance,
            'token_count': token_count,
            'confidence_score': self._calculate_confidence(coherence, stability, entropy),
            'risk_assessment': self._assess_risk_level(coherence, stability, entropy),
            'timestamp': datetime.now().isoformat(),
            'processing_time_ms': 0,  # Will be updated by caller
            'metadata': metadata or {}
        }
        
        self.processing_history.append(result)
        if len(self.processing_history) > 1000:  # Keep last 1000 results
            self.processing_history = self.processing_history[-1000:]
        
        return result
    
    def _preprocess_text(self, text: str) -> List[str]:
        """Enhanced text preprocessing with medical/technical term handling"""
        import re
        
        # Clean and normalize text
        text = text.lower().strip()
        
        # Handle medical abbreviations and technical terms
        medical_patterns = {
            r'\bwbc\b': 'white blood cell',
            r'\brbc\b': 'red blood cell',
            r'\bbp\b': 'blood pressure',
            r'\bhr\b': 'heart rate',
            r'\bai\b': 'artificial intelligence',
            r'\bml\b': 'machine learning'
        }
        
        for pattern, replacement in medical_patterns.items():
            text = re.sub(pattern, replacement, text)
        
        # Tokenize with enhanced splitting
        tokens = re.findall(r'\b\w+\b', text)
        return [token for token in tokens if len(token) > 1]  # Filter single characters
    
    def _empty_result(self) -> Dict[str, float]:
        """Return empty result for invalid input"""
        return {
            'coherence': 0.0,
            'stability': 0.0,
            'entropy': 1.0,
            'resonance': 0.0,
            'complexity': 0.0,
            'coherence_variance': 1.0,
            'token_count': 0,
            'confidence_score': 0.0,
            'risk_assessment': 'high',
            'timestamp': datetime.now().isoformat(),
            'processing_time_ms': 0,
            'metadata': {}
        }

    def _calculate_entropy(self, tokens: List[str]) -> float:
        """Calculate pattern entropy in token sequence"""
        if not tokens:
            return 1.0
            
        # Count token frequencies
        freq_map = {}
        for token in tokens:
            freq_map[token] = freq_map.get(token, 0) + 1
        
        # Calculate Shannon entropy
        total = len(tokens)
        entropy = 0
        for count in freq_map.values():
            p = count / total
            if p > 0:
                entropy -= p * np.log2(p)
        
        # Normalize to 0-1 range
        max_entropy = np.log2(len(freq_map)) if freq_map else 1
        return entropy / max_entropy if max_entropy > 0 else 0
    
    def _calculate_stability(self, tokens: List[str]) -> float:
        """Calculate output stability based on pattern consistency"""
        if len(tokens) < 2:
            return 1.0
            
        # Analyze token transition patterns
        transitions = {}
        for i in range(len(tokens) - 1):
            pair = (tokens[i], tokens[i + 1])
            transitions[pair] = transitions.get(pair, 0) + 1
        
        # Calculate stability as inverse of transition variance
        if not transitions:
            return 1.0
            
        counts = list(transitions.values())
        variance = np.var(counts)
        stability = 1.0 / (1.0 + variance * self.sensitivity)
        
        return min(1.0, max(0.0, stability))
    
    def _calculate_resonance(self, tokens: List[str]) -> float:
        """Calculate quantum resonance patterns"""
        if not tokens:
            return 0.0
            
        # Apply golden ratio analysis
        segment_size = max(1, int(len(tokens) * self.golden_ratio))
        segments = [tokens[i:i + segment_size] 
                   for i in range(0, len(tokens), segment_size)]
        
        # Calculate cross-segment resonance
        resonance_sum = 0
        comparisons = 0
        
        for i, seg1 in enumerate(segments):
            for j, seg2 in enumerate(segments[i + 1:], i + 1):
                similarity = self._segment_similarity(seg1, seg2)
                resonance_sum += similarity
                comparisons += 1
        
        return resonance_sum / comparisons if comparisons > 0 else 0.0
    
    def _segment_similarity(self, seg1: List[str], seg2: List[str]) -> float:
        """Calculate similarity between token segments"""
        if not seg1 or not seg2:
            return 0.0
            
        set1, set2 = set(seg1), set(seg2)
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        return intersection / union if union > 0 else 0.0
    
    def _calculate_complexity(self, tokens: List[str]) -> float:
        """Calculate pattern complexity using advanced linguistic analysis"""
        if not tokens:
            return 0.0
        
        # Analyze sentence structure complexity
        unique_tokens = set(tokens)
        vocabulary_richness = len(unique_tokens) / len(tokens)
        
        # Calculate average word length
        avg_word_length = sum(len(token) for token in tokens) / len(tokens)
        
        # Analyze token position variance
        position_variance = np.var([i for i, _ in enumerate(tokens)])
        normalized_position_variance = position_variance / (len(tokens) ** 2) if len(tokens) > 1 else 0
        
        # Combine complexity factors
        complexity = (
            0.4 * vocabulary_richness +
            0.3 * min(avg_word_length / 10, 1.0) +  # Normalize to 0-1
            0.3 * normalized_position_variance
        )
        
        return min(1.0, max(0.0, complexity))
    
    def _calculate_coherence_variance(self, tokens: List[str]) -> float:
        """Calculate variance in coherence across text segments"""
        if len(tokens) < 4:
            return 0.0
        
        # Split into segments for variance analysis
        segment_size = max(2, len(tokens) // 4)
        segments = [tokens[i:i + segment_size] for i in range(0, len(tokens), segment_size)]
        
        # Calculate coherence for each segment
        segment_coherences = []
        for segment in segments:
            if len(segment) >= 2:
                seg_entropy = self._calculate_entropy(segment)
                seg_stability = self._calculate_stability(segment)
                seg_resonance = self._calculate_resonance(segment)
                seg_coherence = self._apply_quantum_correction(seg_entropy, seg_stability, seg_resonance, 0.5)
                segment_coherences.append(seg_coherence)
        
        return np.var(segment_coherences) if segment_coherences else 0.0
    
    def _calculate_confidence(self, coherence: float, stability: float, entropy: float) -> float:
        """Calculate confidence score for the coherence measurement"""
        # Higher coherence and stability, lower entropy = higher confidence
        base_confidence = (coherence + stability + (1 - entropy)) / 3
        
        # Adjust based on historical consistency if available
        if len(self.processing_history) > 5:
            recent_coherences = [h['coherence'] for h in self.processing_history[-5:]]
            consistency = 1.0 - np.std(recent_coherences)
            base_confidence = (base_confidence + consistency) / 2
        
        return min(1.0, max(0.0, base_confidence))
    
    def _assess_risk_level(self, coherence: float, stability: float, entropy: float) -> str:
        """Assess risk level based on coherence metrics"""
        risk_score = (1 - coherence) * 0.4 + (1 - stability) * 0.4 + entropy * 0.2
        
        if risk_score < 0.3:
            return 'low'
        elif risk_score < 0.6:
            return 'moderate'
        else:
            return 'high'
    
    def _apply_quantum_correction(self, entropy: float, stability: float, 
                                 resonance: float, complexity: float = 0.5) -> float:
        """Enhanced quantum coherence correction formula"""
        # Base coherence from weighted components
        base_coherence = (
            0.35 * (1.0 - entropy) +     # Lower entropy = higher coherence
            0.35 * stability +           # Higher stability = higher coherence  
            0.20 * resonance +           # Higher resonance = higher coherence
            0.10 * (1.0 - complexity)    # Lower complexity can indicate higher coherence
        )
        
        # Apply threshold correction with golden ratio influence
        if base_coherence >= self.threshold:
            # Boost coherence above threshold using golden ratio
            correction = 1.0 + (base_coherence - self.threshold) * self.golden_ratio
        else:
            # Penalize coherence below threshold
            correction = (base_coherence / self.threshold) ** self.golden_ratio
        
        final_coherence = base_coherence * correction
        return min(1.0, max(0.0, final_coherence))
    
    def get_trend_analysis(self, window_size: int = 10) -> Dict:
        """Analyze trends in recent processing history"""
        if len(self.processing_history) < window_size:
            return {'trend': 'insufficient_data', 'direction': 'unknown'}
        
        recent = self.processing_history[-window_size:]
        coherences = [r['coherence'] for r in recent]
        
        # Calculate trend direction
        if len(coherences) >= 2:
            slope = np.polyfit(range(len(coherences)), coherences, 1)[0]
            if slope > 0.01:
                direction = 'improving'
            elif slope < -0.01:
                direction = 'declining'
            else:
                direction = 'stable'
        else:
            direction = 'unknown'
        
        return {
            'trend': 'analyzed',
            'direction': direction,
            'slope': slope if 'slope' in locals() else 0,
            'average_coherence': np.mean(coherences),
            'coherence_std': np.std(coherences),
            'sample_size': len(coherences)
        }

class QOTERealtimeServer:
    def __init__(self, host: str = 'localhost', port: int = 8765):
        self.host = host
        self.port = port
        self.computer = QOTEKappaComputer()
        self.connected_clients = set()
    
    async def handle_client(self, websocket, path):
        """Handle WebSocket client connections"""
        self.connected_clients.add(websocket)
        print(f"Client connected. Total clients: {len(self.connected_clients)}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get('type') == 'analyze':
                        text = data.get('text', '')
                        metadata = data.get('metadata', {})
                        
                        start_time = datetime.now()
                        result = self.computer.compute_coherence_score(text, metadata)
                        processing_time = (datetime.now() - start_time).total_seconds() * 1000
                        result['processing_time_ms'] = processing_time
                        
                        response = {
                            'type': 'analysis_result',
                            'result': result,
                            'request_id': data.get('request_id')
                        }
                        
                        await websocket.send(json.dumps(response))
                    
                    elif data.get('type') == 'get_trends':
                        trends = self.computer.get_trend_analysis()
                        response = {
                            'type': 'trend_analysis',
                            'trends': trends,
                            'request_id': data.get('request_id')
                        }
                        await websocket.send(json.dumps(response))
                        
                except json.JSONDecodeError:
                    error_response = {
                        'type': 'error',
                        'message': 'Invalid JSON format'
                    }
                    await websocket.send(json.dumps(error_response))
                    
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connected_clients.remove(websocket)
            print(f"Client disconnected. Total clients: {len(self.connected_clients)}")
    
    async def start_server(self):
        """Start the WebSocket server"""
        print(f"Starting QOTE Realtime Server on {self.host}:{self.port}")
        async with websockets.serve(self.handle_client, self.host, self.port):
            print("Server started. Waiting for connections...")
            await asyncio.Future()  # Run forever

def generate_braid_map_data(coherence_data: Dict[str, float]) -> Dict:
    """
    Generate visualization data for braid-map display
    Enhanced with real-time particle behavior
    """
    coherence = coherence_data['coherence']
    stability = coherence_data['stability']
    entropy = coherence_data['entropy']
    complexity = coherence_data.get('complexity', 0.5)
    
    particles = {
        'stabilizer': {
            'count': 20,
            'base_x': 0.5,  # Center line
            'oscillation': 0.05 * (1 - stability),
            'color': '#3b82f6',
            'behavior': 'oscillate',
            'frequency': 0.5 + stability * 1.5
        },
        'orb': {
            'count': int(50 * (0.5 + coherence * 0.5)),  # Dynamic count based on coherence
            'radius': 0.1 + (1 - coherence) * 0.15,
            'rotation_speed': coherence * 2,
            'color': '#10b981',
            'behavior': 'orbit',
            'coherence_influence': coherence
        },
        'wings': {
            'count': 80,
            'flutter_intensity': (1 - stability) * 3,
            'spread': 0.3 + entropy * 0.2,
            'color': '#8b5cf6',
            'behavior': 'flutter',
            'complexity_factor': complexity
        },
        'refiner': {
            'count': int(40 * (0.3 + complexity * 0.7)),  # More particles for complex inputs
            'flow_rate': 1 + (1 - coherence) * 2,
            'chaos_factor': entropy,
            'color': '#f59e0b',
            'behavior': 'flow',
            'direction': 'diagonal_down'
        }
    }
    
    environment = {
        'background_intensity': coherence * 0.8,
        'glow_radius': 50 + coherence * 30,
        'field_strength': stability * 100,
        'chaos_indicators': int(entropy * 20) if entropy > 0.5 else 0,
        'resonance_lines': int(coherence_data.get('resonance', 0) * 10)
    }
    
    return {
        'particles': particles,
        'environment': environment,
        'metrics': coherence_data,
        'timestamp': datetime.now().isoformat(),
        'version': '2.0'
    }

def main():
    """
    Enhanced main execution function with command-line interface
    """
    parser = argparse.ArgumentParser(description='QOTE Kappa Computation Engine')
    parser.add_argument('--mode', choices=['analyze', 'server', 'batch'], default='analyze',
                       help='Operation mode: analyze single text, start server, or batch process')
    parser.add_argument('--text', type=str, help='Text to analyze (for analyze mode)')
    parser.add_argument('--file', type=str, help='File containing text to analyze')
    parser.add_argument('--output', type=str, help='Output file for results')
    parser.add_argument('--host', type=str, default='localhost', help='Server host (for server mode)')
    parser.add_argument('--port', type=int, default=8765, help='Server port (for server mode)')
    parser.add_argument('--sensitivity', type=float, default=0.75, help='Sensitivity parameter')
    parser.add_argument('--threshold', type=float, default=0.618, help='Coherence threshold')
    
    args = parser.parse_args()
    
    # Initialize computer with parameters
    computer = QOTEKappaComputer(sensitivity=args.sensitivity, threshold=args.threshold)
    
    if args.mode == 'server':
        server = QOTERealtimeServer(args.host, args.port)
        try:
            asyncio.run(server.start_server())
        except KeyboardInterrupt:
            print("\nServer stopped by user")
            
    elif args.mode == 'analyze':
        # Single text analysis
        if args.text:
            sample_text = args.text
        elif args.file and os.path.exists(args.file):
            with open(args.file, 'r', encoding='utf-8') as f:
                sample_text = f.read()
        else:
            # Default sample text
            sample_text = """
            The patient presents with symptoms of fatigue and shortness of breath. 
            Lab results show elevated white blood cell count. Differential diagnosis 
            includes infection, inflammatory conditions, or early-stage hematologic 
            malignancy. Further testing recommended.
            """
        
        # Compute coherence metrics
        print("Computing QOTE coherence metrics...")
        start_time = datetime.now()
        results = computer.compute_coherence_score(sample_text.strip())
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        results['processing_time_ms'] = processing_time
        
        # Generate braid-map data
        braid_data = generate_braid_map_data(results)
        
        # Display results
        print("\n=== QOTE Coherence Analysis ===")
        print(f"Coherence Score: {results['coherence']:.3f}")
        print(f"Stability Index: {results['stability']:.3f}")
        print(f"Pattern Entropy: {results['entropy']:.3f}")
        print(f"Resonance Level: {results['resonance']:.3f}")
        print(f"Complexity Factor: {results['complexity']:.3f}")
        print(f"Confidence Score: {results['confidence_score']:.3f}")
        print(f"Risk Assessment: {results['risk_assessment']}")
        print(f"Processing Time: {results['processing_time_ms']:.1f}ms")
        print(f"Token Count: {results['token_count']}")
        
        # Save results
        output_file = args.output or f"qote_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump({
                'analysis': results,
                'braid_map': braid_data
            }, f, indent=2)
        
        print(f"\nResults saved to: {output_file}")
        
        # Generate visualization if matplotlib available
        try:
            create_coherence_plot(results)
        except ImportError:
            print("Matplotlib not available. Skipping visualization.")
    
    elif args.mode == 'batch':
        print("Batch processing mode not yet implemented")
        sys.exit(1)
    
    return results if args.mode == 'analyze' else None

def create_coherence_plot(results: Dict[str, float]):
    """
    Create matplotlib visualization of coherence metrics
    """
    metrics = ['Coherence', 'Stability', 'Resonance', '1-Entropy']
    values = [
        results['coherence'],
        results['stability'], 
        results['resonance'],
        1 - results['entropy']
    ]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    # Bar chart
    colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
    bars = ax1.bar(metrics, values, color=colors, alpha=0.7)
    ax1.set_ylim(0, 1)
    ax1.set_ylabel('Score')
    ax1.set_title('QOTE Coherence Metrics')
    ax1.grid(True, alpha=0.3)
    
    # Add value labels on bars
    for bar, value in zip(bars, values):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f'{value:.3f}', ha='center', va='bottom')
    
    # Radar chart
    angles = np.linspace(0, 2*np.pi, len(metrics), endpoint=False)
    values_radar = values + [values[0]]  # Close the polygon
    angles_radar = np.concatenate((angles, [angles[0]]))
    
    ax2 = plt.subplot(122, projection='polar')
    ax2.plot(angles_radar, values_radar, 'o-', linewidth=2, color='#10b981')
    ax2.fill(angles_radar, values_radar, alpha=0.25, color='#10b981')
    ax2.set_xticks(angles)
    ax2.set_xticklabels(metrics)
    ax2.set_ylim(0, 1)
    ax2.set_title('QOTE Coherence Profile')
    
    plt.tight_layout()
    plt.savefig('qote_coherence_analysis.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print("Visualization saved as: qote_coherence_analysis.png")

if __name__ == "__main__":
    main()

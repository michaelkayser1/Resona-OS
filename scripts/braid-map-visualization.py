"""
QOTE Braid-Map Visualization Engine
Advanced particle system for quantum coherence display
Enhanced with real-time updates and web integration
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Circle, FancyBboxPatch
import json
import asyncio
import websockets
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import argparse
import threading

class BraidMapParticle:
    def __init__(self, x: float, y: float, particle_type: str, **kwargs):
        self.x = x
        self.y = y
        self.initial_x = x
        self.initial_y = y
        self.type = particle_type
        self.vx = kwargs.get('vx', 0)
        self.vy = kwargs.get('vy', 0)
        self.size = kwargs.get('size', 1)
        self.color = kwargs.get('color', '#ffffff')
        self.age = 0
        self.max_age = kwargs.get('max_age', 1000)
        self.alpha = kwargs.get('alpha', 1.0)
        
        if particle_type == 'orb':
            self.angle = kwargs.get('angle', 0)
            self.radius = kwargs.get('radius', 30)
            self.angular_velocity = kwargs.get('angular_velocity', 0.02)
            self.coherence_influence = kwargs.get('coherence_influence', 0.5)
        elif particle_type == 'wing':
            self.flutter_phase = kwargs.get('flutter_phase', 0)
            self.flutter_amplitude = kwargs.get('flutter_amplitude', 2)
            self.wing_side = kwargs.get('wing_side', 1)  # 1 for right, -1 for left
        elif particle_type == 'refiner':
            self.flow_direction = kwargs.get('flow_direction', (1, 0.5))
            self.chaos_factor = kwargs.get('chaos_factor', 0.3)
        elif particle_type == 'stabilizer':
            self.oscillation_phase = kwargs.get('oscillation_phase', 0)
            self.base_frequency = kwargs.get('base_frequency', 1.0)

class QOTEBraidMapVisualizer:
    def __init__(self, width: int = 800, height: int = 600):
        self.width = width
        self.height = height
        self.particles = []
        self.center_x = width // 2
        self.center_y = height // 2
        
        self.coherence = 0.87
        self.stability = 0.92
        self.entropy = 0.34
        self.complexity = 0.42
        self.resonance = 0.65
        
        # Animation parameters
        self.frame_count = 0
        self.time_scale = 0.1
        self.is_paused = False
        
        self.fps_history = []
        self.last_fps_time = datetime.now()
        
        # Initialize matplotlib with enhanced styling
        plt.style.use('dark_background')
        self.fig, self.ax = plt.subplots(figsize=(12, 9))
        self.ax.set_xlim(0, width)
        self.ax.set_ylim(0, height)
        self.ax.set_aspect('equal')
        self.ax.set_facecolor('#0f172a')
        
        self.setup_interactive_controls()
        
    def setup_interactive_controls(self):
        """Setup interactive controls for real-time parameter adjustment"""
        from matplotlib.widgets import Slider, Button
        
        # Create control panel
        plt.subplots_adjust(bottom=0.25)
        
        # Coherence slider
        ax_coherence = plt.axes([0.2, 0.15, 0.5, 0.03])
        self.coherence_slider = Slider(ax_coherence, 'Coherence', 0.0, 1.0, 
                                     valinit=self.coherence, valfmt='%.2f')
        self.coherence_slider.on_changed(self.update_coherence)
        
        # Stability slider
        ax_stability = plt.axes([0.2, 0.10, 0.5, 0.03])
        self.stability_slider = Slider(ax_stability, 'Stability', 0.0, 1.0, 
                                     valinit=self.stability, valfmt='%.2f')
        self.stability_slider.on_changed(self.update_stability)
        
        # Entropy slider
        ax_entropy = plt.axes([0.2, 0.05, 0.5, 0.03])
        self.entropy_slider = Slider(ax_entropy, 'Entropy', 0.0, 1.0, 
                                   valinit=self.entropy, valfmt='%.2f')
        self.entropy_slider.on_changed(self.update_entropy)
        
        # Control buttons
        ax_pause = plt.axes([0.8, 0.15, 0.1, 0.04])
        self.pause_button = Button(ax_pause, 'Pause')
        self.pause_button.on_clicked(self.toggle_pause)
        
        ax_reset = plt.axes([0.8, 0.10, 0.1, 0.04])
        self.reset_button = Button(ax_reset, 'Reset')
        self.reset_button.on_clicked(self.reset_visualization)
    
    def update_coherence(self, val):
        self.coherence = val
        self.update_particle_behaviors()
    
    def update_stability(self, val):
        self.stability = val
        self.update_particle_behaviors()
    
    def update_entropy(self, val):
        self.entropy = val
        self.update_particle_behaviors()
    
    def toggle_pause(self, event):
        self.is_paused = not self.is_paused
        self.pause_button.label.set_text('Resume' if self.is_paused else 'Pause')
    
    def reset_visualization(self, event):
        self.frame_count = 0
        self.initialize_particles()

    def initialize_particles(self):
        """Initialize all particle systems with enhanced behaviors"""
        self.particles = []
        
        for i in range(20):
            y_pos = i * (self.height / 20)
            particle = BraidMapParticle(
                x=self.center_x,
                y=y_pos,
                particle_type='stabilizer',
                size=2 + np.random.random() * 3,
                color='#3b82f6',
                oscillation_phase=i * 0.3,  # Phase offset for wave effect
                base_frequency=0.5 + self.stability * 1.5
            )
            self.particles.append(particle)
        
        orb_count = int(50 * (0.5 + self.coherence * 0.5))
        for i in range(orb_count):
            angle = (i / orb_count) * 2 * np.pi  # Even distribution
            radius = 30 + np.random.random() * 40
            particle = BraidMapParticle(
                x=self.center_x + np.cos(angle) * radius,
                y=self.center_y + np.sin(angle) * radius,
                particle_type='orb',
                size=2 + np.random.random() * 4,
                color='#10b981',
                angle=angle,
                radius=radius,
                angular_velocity=0.02 * self.coherence,
                coherence_influence=self.coherence
            )
            self.particles.append(particle)
        
        for i in range(80):
            side = 1 if i % 2 == 0 else -1
            x_offset = side * (100 + np.random.random() * 150)
            y_offset = -100 + np.random.random() * 200
            
            particle = BraidMapParticle(
                x=self.center_x + x_offset,
                y=self.center_y + y_offset,
                particle_type='wing',
                size=1 + np.random.random() * 3,
                color='#8b5cf6',
                flutter_phase=np.random.random() * 2 * np.pi,
                flutter_amplitude=2 * (1 - self.stability),
                wing_side=side
            )
            self.particles.append(particle)
        
        refiner_count = int(40 * (0.3 + self.complexity * 0.7))
        for i in range(refiner_count):
            particle = BraidMapParticle(
                x=np.random.random() * self.width,
                y=np.random.random() * self.height,
                particle_type='refiner',
                size=1 + np.random.random() * 2,
                color='#f59e0b',
                flow_direction=(1 + (1 - self.coherence) * 2, 0.5 + (1 - self.coherence)),
                chaos_factor=self.entropy
            )
            self.particles.append(particle)
    
    def update_particle_behaviors(self):
        """Update particle behaviors based on current parameters"""
        for particle in self.particles:
            if particle.type == 'orb':
                particle.angular_velocity = 0.02 * self.coherence
                particle.coherence_influence = self.coherence
            elif particle.type == 'wing':
                particle.flutter_amplitude = 2 * (1 - self.stability)
            elif particle.type == 'refiner':
                flow_x = 1 + (1 - self.coherence) * 2
                flow_y = 0.5 + (1 - self.coherence)
                particle.flow_direction = (flow_x, flow_y)
                particle.chaos_factor = self.entropy
            elif particle.type == 'stabilizer':
                particle.base_frequency = 0.5 + self.stability * 1.5
    
    def update_particles(self):
        """Update particle positions and properties with enhanced physics"""
        if self.is_paused:
            return
            
        self.frame_count += 1
        time = self.frame_count * self.time_scale
        
        for particle in self.particles:
            particle.age += 1
            
            if particle.type == 'stabilizer':
                oscillation = np.sin(time * particle.base_frequency + particle.oscillation_phase) * 5 * (1 - self.stability)
                particle.x = self.center_x + oscillation
                
            elif particle.type == 'orb':
                particle.angle += particle.angular_velocity
                target_radius = 30 + (1 - self.coherence) * 40
                particle.radius += (target_radius - particle.radius) * 0.1
                
                # Base orbital position
                base_x = self.center_x + np.cos(particle.angle) * particle.radius
                base_y = self.center_y + np.sin(particle.angle) * particle.radius
                
                # Add coherence-based stability
                stability_factor = self.coherence * 0.8 + 0.2
                particle.x = base_x + (np.random.random() - 0.5) * 4 * (1 - stability_factor)
                particle.y = base_y + (np.random.random() - 0.5) * 4 * (1 - stability_factor)
                
                # Update alpha based on coherence
                particle.alpha = 0.3 + self.coherence * 0.7
                
            elif particle.type == 'wing':
                particle.flutter_phase += 0.1 + (1 - self.stability) * 0.1
                flutter_x = np.sin(particle.flutter_phase) * particle.flutter_amplitude
                flutter_y = np.cos(particle.flutter_phase * 0.7) * particle.flutter_amplitude
                
                # Apply flutter with side bias
                particle.x += flutter_x * (1 - self.stability) * particle.wing_side * 0.5
                particle.y += flutter_y * (1 - self.stability)
                
                # Constrain to wing areas with elastic boundaries
                side_center_x = self.center_x + particle.wing_side * 150
                dx = particle.x - side_center_x
                dy = particle.y - self.center_y
                
                # Elastic boundary forces
                if abs(dx) > 100:
                    particle.vx -= dx * 0.03
                if abs(dy) > 120:
                    particle.vy -= dy * 0.03
                
                particle.x += particle.vx
                particle.y += particle.vy
                particle.vx *= 0.95
                particle.vy *= 0.95
                
                # Update alpha based on stability
                particle.alpha = 0.4 + self.stability * 0.6
                
            elif particle.type == 'refiner':
                flow_x, flow_y = particle.flow_direction
                chaos_influence = particle.chaos_factor * 2
                
                # Add chaos-based random motion
                particle.x += flow_x + (np.random.random() - 0.5) * chaos_influence
                particle.y += flow_y + (np.random.random() - 0.5) * chaos_influence
                
                # Reset with fade effect if out of bounds
                if particle.x > self.width or particle.y > self.height:
                    particle.x = np.random.random() * 100
                    particle.y = np.random.random() * 100
                    particle.alpha = 0.2  # Fade in
                else:
                    particle.alpha = min(1.0, particle.alpha + 0.02)
    
    def draw_connections(self):
        """Draw connecting lines between related particles with enhanced effects"""
        stabilizer_particles = [p for p in self.particles if p.type == 'stabilizer']
        if len(stabilizer_particles) > 1:
            # Create smooth curve through stabilizer points
            x_coords = [p.x for p in stabilizer_particles]
            y_coords = [p.y for p in stabilizer_particles]
            
            # Draw main stabilizer line
            self.ax.plot(x_coords, y_coords, color='#3b82f6', alpha=0.6, linewidth=2)
            
            # Add glow effect
            self.ax.plot(x_coords, y_coords, color='#3b82f6', alpha=0.2, linewidth=6)
        
        orb_particles = [p for p in self.particles if p.type == 'orb']
        connection_count = 0
        max_connections = 20  # Limit for performance
        
        for i, p1 in enumerate(orb_particles):
            if connection_count >= max_connections:
                break
            for p2 in orb_particles[i + 1:i + 4]:  # Connect to nearby particles
                distance = np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
                if distance < 60:
                    alpha = (60 - distance) / 60 * 0.3 * self.coherence
                    self.ax.plot([p1.x, p2.x], [p1.y, p2.y],
                                color='#10b981', alpha=alpha, linewidth=1)
                    connection_count += 1
        
        wing_particles = [p for p in self.particles if p.type == 'wing']
        left_wings = [p for p in wing_particles if p.wing_side == -1]
        right_wings = [p for p in wing_particles if p.wing_side == 1]
        
        # Connect corresponding wing particles if stability is high
        if self.stability > 0.7 and len(left_wings) > 0 and len(right_wings) > 0:
            for i in range(min(len(left_wings), len(right_wings), 5)):
                alpha = (self.stability - 0.7) * 0.5
                self.ax.plot([left_wings[i].x, right_wings[i].x], 
                           [left_wings[i].y, right_wings[i].y],
                           color='#8b5cf6', alpha=alpha, linewidth=0.5)
    
    def draw_special_effects(self):
        """Draw special visual effects with enhanced graphics"""
        glow_radius = 50 + (self.coherence * 30)
        pulse_factor = 1 + 0.2 * np.sin(self.frame_count * 0.1)
        effective_radius = glow_radius * pulse_factor
        
        # Multiple glow layers for depth
        for i, (radius_mult, alpha_mult) in enumerate([(1.0, 0.15), (0.7, 0.1), (0.4, 0.05)]):
            glow_circle = Circle((self.center_x, self.center_y), 
                               effective_radius * radius_mult,
                               color='#10b981', alpha=alpha_mult * self.coherence, 
                               fill=True)
            self.ax.add_patch(glow_circle)
        
        if self.stability > 0.6:
            field_radius = 200 * self.stability
            field_alpha = (self.stability - 0.6) * 0.1
            field_circle = Circle((self.center_x, self.center_y), field_radius,
                                color='#3b82f6', alpha=field_alpha, fill=True)
            self.ax.add_patch(field_circle)
        
        if self.entropy > 0.4:
            chaos_count = int((self.entropy - 0.4) * 30)
            for _ in range(chaos_count):
                x = np.random.random() * self.width
                y = np.random.random() * self.height
                size = 1 + np.random.random() * 3
                alpha = 0.2 + (self.entropy - 0.4) * 0.5
                chaos_circle = Circle((x, y), size, color='#ef4444', alpha=alpha)
                self.ax.add_patch(chaos_circle)
        
        if hasattr(self, 'resonance') and self.resonance > 0.5:
            line_count = int((self.resonance - 0.5) * 10)
            for i in range(line_count):
                angle = (i / line_count) * 2 * np.pi
                start_radius = 80
                end_radius = 150
                start_x = self.center_x + np.cos(angle) * start_radius
                start_y = self.center_y + np.sin(angle) * start_radius
                end_x = self.center_x + np.cos(angle) * end_radius
                end_y = self.center_y + np.sin(angle) * end_radius
                
                alpha = (self.resonance - 0.5) * 0.3
                self.ax.plot([start_x, end_x], [start_y, end_y],
                           color='#f59e0b', alpha=alpha, linewidth=1)
    
    def draw_hud(self):
        """Draw heads-up display with metrics and performance info"""
        hud_text = [
            f"Coherence: {self.coherence:.3f}",
            f"Stability: {self.stability:.3f}",
            f"Entropy: {self.entropy:.3f}",
            f"Particles: {len(self.particles)}",
            f"Frame: {self.frame_count}"
        ]
        
        # Calculate FPS
        current_time = datetime.now()
        if len(self.fps_history) > 0:
            time_diff = (current_time - self.last_fps_time).total_seconds()
            if time_diff > 0:
                fps = 1.0 / time_diff
                self.fps_history.append(fps)
                if len(self.fps_history) > 10:
                    self.fps_history = self.fps_history[-10:]
                avg_fps = sum(self.fps_history) / len(self.fps_history)
                hud_text.append(f"FPS: {avg_fps:.1f}")
        
        self.last_fps_time = current_time
        
        # Draw HUD background
        hud_box = FancyBboxPatch((10, self.height - 120), 150, 100,
                               boxstyle="round,pad=5", 
                               facecolor='black', alpha=0.7,
                               edgecolor='#3b82f6', linewidth=1)
        self.ax.add_patch(hud_box)
        
        # Draw HUD text
        for i, text in enumerate(hud_text):
            self.ax.text(15, self.height - 25 - i * 15, text, 
                        color='white', fontsize=10, fontfamily='monospace')

    def animate_frame(self, frame):
        """Enhanced animation function with performance optimization"""
        self.ax.clear()
        self.ax.set_xlim(0, self.width)
        self.ax.set_ylim(0, self.height)
        self.ax.set_aspect('equal')
        self.ax.set_facecolor('#0f172a')
        
        # Update particle positions
        self.update_particles()
        
        # Draw special effects first (background)
        self.draw_special_effects()
        
        # Draw connections
        self.draw_connections()
        
        for particle in self.particles:
            alpha = getattr(particle, 'alpha', 1.0)
            self.ax.scatter(particle.x, particle.y, 
                          s=particle.size**2, c=particle.color, 
                          alpha=alpha, edgecolors='none')
        
        # Draw HUD
        self.draw_hud()
        
        # Remove axes and add title
        self.ax.set_xticks([])
        self.ax.set_yticks([])
        
        title = f'QOTE Braid-Map Visualization v2.0'
        if self.is_paused:
            title += ' [PAUSED]'
        
        self.ax.set_title(title, color='white', fontsize=16, pad=20)
        
        return []

    def start_animation(self, interval: int = 50):
        """Start the animated visualization"""
        self.initialize_particles()
        
        ani = animation.FuncAnimation(
            self.fig, self.animate_frame, frames=1000,
            interval=interval, blit=False, repeat=True
        )
        
        plt.tight_layout()
        plt.show()
        
        return ani
    
    def save_static_frame(self, filename: str = None):
        """Save a static frame of the visualization"""
        if filename is None:
            filename = f"qote_braid_map_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        
        self.initialize_particles()
        self.animate_frame(0)
        
        plt.savefig(filename, dpi=300, bbox_inches='tight', 
                   facecolor='#0f172a', edgecolor='none')
        print(f"Braid-map visualization saved as: {filename}")
        
        return filename

class BraidMapWebSocketServer:
    def __init__(self, visualizer: QOTEBraidMapVisualizer, host: str = 'localhost', port: int = 8766):
        self.visualizer = visualizer
        self.host = host
        self.port = port
        self.connected_clients = set()
    
    async def handle_client(self, websocket, path):
        """Handle WebSocket client connections for real-time parameter updates"""
        self.connected_clients.add(websocket)
        print(f"Visualization client connected. Total: {len(self.connected_clients)}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get('type') == 'update_params':
                        params = data.get('params', {})
                        if 'coherence' in params:
                            self.visualizer.coherence = max(0, min(1, params['coherence']))
                        if 'stability' in params:
                            self.visualizer.stability = max(0, min(1, params['stability']))
                        if 'entropy' in params:
                            self.visualizer.entropy = max(0, min(1, params['entropy']))
                        if 'complexity' in params:
                            self.visualizer.complexity = max(0, min(1, params['complexity']))
                        
                        self.visualizer.update_particle_behaviors()
                        
                        response = {
                            'type': 'params_updated',
                            'current_params': {
                                'coherence': self.visualizer.coherence,
                                'stability': self.visualizer.stability,
                                'entropy': self.visualizer.entropy,
                                'complexity': self.visualizer.complexity
                            }
                        }
                        await websocket.send(json.dumps(response))
                        
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({'type': 'error', 'message': 'Invalid JSON'}))
                    
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connected_clients.remove(websocket)
            print(f"Visualization client disconnected. Total: {len(self.connected_clients)}")
    
    def start_server_thread(self):
        """Start WebSocket server in separate thread"""
        def run_server():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            start_server = websockets.serve(self.handle_client, self.host, self.port)
            loop.run_until_complete(start_server)
            print(f"Braid-Map WebSocket server started on {self.host}:{self.port}")
            loop.run_forever()
        
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()
        return server_thread

def main():
    """Enhanced main execution function with command-line interface"""
    parser = argparse.ArgumentParser(description='QOTE Braid-Map Visualization Engine v2.0')
    parser.add_argument('--width', type=int, default=800, help='Visualization width')
    parser.add_argument('--height', type=int, default=600, help='Visualization height')
    parser.add_argument('--coherence', type=float, default=0.87, help='Initial coherence value')
    parser.add_argument('--stability', type=float, default=0.92, help='Initial stability value')
    parser.add_argument('--entropy', type=float, default=0.34, help='Initial entropy value')
    parser.add_argument('--complexity', type=float, default=0.42, help='Initial complexity value')
    parser.add_argument('--server', action='store_true', help='Enable WebSocket server')
    parser.add_argument('--host', type=str, default='localhost', help='WebSocket server host')
    parser.add_argument('--port', type=int, default=8766, help='WebSocket server port')
    parser.add_argument('--save-frame', type=str, help='Save static frame to file')
    parser.add_argument('--interactive', action='store_true', default=True, help='Enable interactive controls')
    
    args = parser.parse_args()
    
    # Create visualizer with parameters
    visualizer = QOTEBraidMapVisualizer(args.width, args.height)
    visualizer.coherence = max(0, min(1, args.coherence))
    visualizer.stability = max(0, min(1, args.stability))
    visualizer.entropy = max(0, min(1, args.entropy))
    visualizer.complexity = max(0, min(1, args.complexity))
    
    # Start WebSocket server if requested
    if args.server:
        try:
            import websockets
            server = BraidMapWebSocketServer(visualizer, args.host, args.port)
            server.start_server_thread()
        except ImportError:
            print("WebSocket support not available. Install websockets package.")
    
    if args.save_frame:
        # Save static frame
        filename = visualizer.save_static_frame(args.save_frame)
        print(f"Static frame saved as: {filename}")
        return
    
    # Start interactive visualization
    print("Starting QOTE Braid-Map Visualization...")
    print("Use the sliders to adjust parameters in real-time")
    print("Press 'Pause' to pause/resume animation")
    print("Press 'Reset' to reinitialize particles")
    
    try:
        visualizer.start_animation()
    except KeyboardInterrupt:
        print("\nVisualization stopped by user")

if __name__ == "__main__":
    main()

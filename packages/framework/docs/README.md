# Graph Paper Games Dual Design System Documentation

Welcome to the comprehensive documentation for the Graph Paper Games Dual Design System! This framework enables developers to create games that blend modern digital interfaces with authentic hand-drawn paper-and-pencil aesthetics.

## 📖 Documentation Overview

### [Dual Design System Guide](./DUAL_DESIGN_SYSTEM.md)
**Start here!** Complete overview of the dual design system philosophy, core concepts, and usage patterns.
- System philosophy and architecture
- Quick start guide with examples  
- Component overview and pen styles
- Animation system and responsive design
- Best practices and troubleshooting

### [Integration Guide](./INTEGRATION_GUIDE.md)
**Step-by-step tutorial** for integrating the dual design system into your game projects.
- Installation and setup
- Complete working examples
- Game logic implementation
- Advanced patterns (AI, sound, animations)
- Testing and performance optimization
- Deployment considerations

### [API Reference](./API_REFERENCE.md) 
**Complete technical reference** for all components, hooks, and utilities.
- Detailed component APIs with props tables
- Hook interfaces and return types  
- Utility function signatures
- TypeScript type definitions
- Error handling and performance notes

## 🚀 Quick Start

```bash
# Install the framework
pnpm add @gpg/framework @gpg/shared

# Basic usage
import { 
  DualSystemProvider,
  TruePaperLayout,
  PaperSheet,
  HandDrawnGrid 
} from '@gpg/framework';
```

```tsx
<DualSystemProvider>
  <TruePaperLayout>
    <header>{/* Modern UI controls */}</header>
    <main>
      <PaperSheet gameWidth={300} gameHeight={300}>
        <HandDrawnGrid columns={3} rows={3} />
        {/* Hand-drawn game content */}
      </PaperSheet>
    </main>
  </TruePaperLayout>
</DualSystemProvider>
```

## 🎯 Key Concepts

### **Dual Design Philosophy**
> "The paper holds only the game, the interface surrounds the paper."

The system enforces clear separation:
- **Modern UI**: Digital controls, menus, scores (surrounding the paper)
- **Hand-drawn**: Game boards, pieces, symbols (on the paper surface)

### **Component Categories**

**🖥️ Modern UI Components**
- `PlayerDisplay` - Player information and controls
- Modern buttons, forms, menus
- Clean, accessible, responsive design

**✏️ Hand-drawn Components**  
- `PaperSheet` - Authentic paper background
- `HandDrawnGrid` - Animated grid lines
- `GameSymbol` - Animated X, O, dots, ships
- `WinningLine` - Victory line animations

**🏗️ System Components**
- `DualSystemProvider` - Root context provider
- `TruePaperLayout` - Layout with enforced separation
- Boundary enforcement HOCs

### **Pen Styles**
Four distinct pen styles affect all hand-drawn elements:
- **Ballpoint** - Clean, consistent lines
- **Pencil** - Textured, sketchy appearance  
- **Marker** - Bold, saturated strokes
- **Fountain** - Elegant, flowing lines with variable width

## 🏃‍♂️ Getting Started Paths

### **For New Games**
1. Read the [Dual Design System Guide](./DUAL_DESIGN_SYSTEM.md) for concepts
2. Follow the [Integration Guide](./INTEGRATION_GUIDE.md) step-by-step  
3. Reference the [API documentation](./API_REFERENCE.md) as needed

### **For Existing Games**
1. Review the [Migration patterns](./INTEGRATION_GUIDE.md#migration-from-legacy-systems)
2. Start with the [boundary separation](./DUAL_DESIGN_SYSTEM.md#system-boundaries--type-safety)
3. Gradually migrate UI and game components

### **For Framework Contributors**
1. Understand the [complete architecture](./DUAL_DESIGN_SYSTEM.md#architecture)
2. Review [component APIs](./API_REFERENCE.md) and type systems
3. Follow [best practices](./DUAL_DESIGN_SYSTEM.md#best-practices) for new components

## 🎮 Example Games

The framework includes complete example implementations:

**Tic-Tac-Toe** 
- Grid-based game with AI
- Pen style switching
- Victory animations
- [View example →](../examples/TicTacToe.tsx)

**Connect Four**
- Drop-piece mechanics  
- Animated falling pieces
- Dynamic grid sizing
- [View example →](../examples/ConnectFour.tsx)

**Battleship**
- Ship placement interface
- Hit/miss animations
- Dual-grid layout
- [View example →](../examples/Battleship.tsx)

## 🔧 Development Tools

### **Visual Style Lab**
Interactive development environment for testing components:
```bash
cd research/visual-style-lab
pnpm dev
```
Visit http://localhost:3001 to see live component demos.

### **Storybook** (Coming Soon)
Isolated component development and testing environment.

### **Testing Utilities**
Built-in testing utilities for dual system components:
```tsx
import { renderWithDualSystem } from '@gpg/framework/testing';

test('renders game correctly', () => {
  renderWithDualSystem(<MyGame />);
  // Test modern UI and hand-drawn elements
});
```

## 📱 Responsive Design

The framework includes built-in responsive behavior:
- **Desktop**: Full header/footer or sidebar layouts
- **Tablet**: Adaptive layout with larger touch targets
- **Mobile**: Stacked layout with optimized paper size

Access responsive utilities:
```tsx
const { isMobile, isTablet, isDesktop } = useLayout();
```

## ♿ Accessibility

Modern UI components include comprehensive accessibility features:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast support
- Focus management

Hand-drawn components provide semantic structure while maintaining visual authenticity.

## ⚡ Performance

### **Optimizations**
- Component memoization
- Lazy loading of heavy animations
- Efficient SVG rendering
- Animation debouncing
- Tree shaking support

### **Bundle Size**
- Core system: ~15KB gzipped
- Individual components: ~2-5KB each
- Optional animation system: ~8KB
- Total typical usage: ~25-35KB

## 🐛 Troubleshooting

### **Common Issues**

**Components not animating**
```tsx
// ❌ Missing animate prop
<GameSymbol symbol="X" cellPosition={0} />

// ✅ Enable animation
<GameSymbol symbol="X" cellPosition={0} animate autoStart />
```

**Boundary violations**
```tsx
// ❌ Hand-drawn component outside paper
<div><HandDrawnGrid columns={3} rows={3} /></div>

// ✅ Wrap in PaperSheet
<PaperSheet gameWidth={200} gameHeight={200}>
  <HandDrawnGrid columns={3} rows={3} />
</PaperSheet>
```

**Missing context**
```tsx
// ❌ Components without provider
<GameSymbol symbol="X" cellPosition={0} />

// ✅ Wrap in provider
<DualSystemProvider>
  <PaperSheet gameWidth={200} gameHeight={200}>
    <GameSymbol symbol="X" cellPosition={0} />
  </PaperSheet>
</DualSystemProvider>
```

See the [complete troubleshooting guide](./DUAL_DESIGN_SYSTEM.md#troubleshooting).

## 📈 Roadmap

### **Current (v1.0)**
- ✅ Core dual system architecture
- ✅ Hand-drawn components with 4 pen styles
- ✅ Modern UI components
- ✅ Layout system with responsive design
- ✅ Animation system
- ✅ TypeScript support
- ✅ Comprehensive documentation

### **Upcoming (v1.1)**
- 🔄 Storybook integration  
- 🔄 Testing utilities
- 🔄 Performance monitoring tools
- 🔄 Additional paper types
- 🔄 Sound system integration
- 🔄 Advanced animation sequences

### **Future (v2.0)**
- 📋 3D paper effects
- 📋 Multiplayer synchronization
- 📋 AI integration helpers
- 📋 Mobile-specific optimizations
- 📋 Web Components version

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Read the documentation** to understand the system
2. **Check existing issues** or create new ones
3. **Follow coding standards** established in the codebase
4. **Add tests** for new components
5. **Update documentation** for any API changes

### **Development Setup**
```bash
git clone [repository]
cd GraphPaperGames
pnpm install
pnpm build
cd packages/framework
pnpm test
```

## 📞 Support

- **📚 Documentation**: You're reading it!
- **🐛 Bug Reports**: [Open an issue](../../issues)
- **💬 Discussions**: [Join the discussion](../../discussions)  
- **📧 Direct Contact**: [maintainer@email.com](mailto:maintainer@email.com)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](../../../LICENSE) for details.

---

## Next Steps

1. **New to the system?** Start with [Dual Design System Guide](./DUAL_DESIGN_SYSTEM.md)
2. **Ready to build?** Follow the [Integration Guide](./INTEGRATION_GUIDE.md)
3. **Need reference?** Check the [API Reference](./API_REFERENCE.md)
4. **Want examples?** Explore the [examples directory](../examples/)

Happy building! 🎮✨
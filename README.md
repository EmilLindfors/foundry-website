# Lindfors Foundry Website

This is the official website for [Lindfors Foundry](https://lindforsfoundry.com), a specialized consultancy providing AI solutions for Norwegian aquaculture. The website showcases our services, expertise, and insights through a modern, responsive design.

## Technology Stack

### Core Technologies
- **React + TypeScript**: For type-safe component development
- **Vite**: For fast development and optimized builds
- **React Router**: For client-side routing
- **Tailwind CSS**: For utility-first styling and dark mode support
- **Rust**: A robust Rust-based static blog compiler is included that transforms Markdown content into a full-featured blog with image optimization.
Read more in the [md-builder](/md-builder/README.md) subdirectory.

### Design System
- Custom design system built on Tailwind CSS
- Dark/Light mode support with theme persistence
- Responsive components following modern design patterns
- Consistent color palette optimized for accessibility

### Key Components
- Custom Button and LinkButton components for consistent interaction patterns
- Responsive NavHeader with transparent-to-solid transition
- Animated background effects using SVG and React
- Blog system with Markdown support
- Themeable UI components with dark mode support

### Performance Features
- Lazy loading and code splitting
- Optimized asset loading
- Responsive images
- Smooth animations and transitions

## Project Structure

```
src/
├── assets/
│   ├── images/
│   └── content/
├── components/
│   ├── ui/          # Base UI components
│   └── navigation/  # Navigation components
├── contexts/        # React contexts (theme, etc.)
├── lib/            # Utilities and helpers
├── pages/          # Route pages
└── styles/         # Global styles
```

## Features

- 🌙 Dark/Light mode with system preference detection
- 📱 Fully responsive design
- 🎨 Modern UI with smooth animations
- 📝 Blog with Markdown support
- 🎯 SEO optimized
- 🚀 Fast page loads
- ♿ Accessibility focused

## Development

### Prerequisites
```bash
node >= 18.0.0
```

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/EmilLindfors/foundry-site.git
```

2. Install dependencies:
```bash
cd lindforsfoundry
bun i
```

3. Start development server:
```bash
bun run dev
```

4. Build for production:
```bash
bun run build
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=your_api_url_here
```

## Design Decisions

### Why Tailwind CSS?
- Utility-first approach for rapid development
- Easy theme customization
- Built-in dark mode support
- Excellent responsive design utilities

### Why Custom Components?
- Consistent brand identity
- Reusable across projects
- Type-safe implementation
- Optimized for our specific needs

### Performance Considerations
- SVG animations for lightweight interactivity
- Optimized image loading
- Minimal dependencies
- Code splitting for optimal chunk sizes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is proprietary and confidential. All rights reserved.

## About Lindfors Foundry

Lindfors Foundry specializes in developing cutting-edge AI solutions for the Norwegian aquaculture industry. We combine expertise in Rust programming and artificial intelligence to help fish farming operations optimize their processes and embrace sustainable technologies.

## Contact

For inquiries about this website or our services, please visit [lindforsfoundry.com](https://lindforsfoundry.com/contact).

---
Built with ❤️ using React + TypeScript + Tailwind + Rust


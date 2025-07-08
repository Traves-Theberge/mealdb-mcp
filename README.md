# MealDB -  MCP Server

🍕 **Hey Vibe Coders, ever have the problem where your partner asks you, "What do you want to eat?" and you just stare blankly? No more endless scrolling through delivery apps or decision paralysis! Let AI help you discover your next meal!** 🤖✨

A **Model Context Protocol (MCP)** server that provides AI assistants with access to [**TheMealDB**](https://www.themealdb.com/) API for recipe and meal information. This server enables AI assistants to search for recipes, get detailed meal information, browse categories, and explore ingredients.

🌟 **Powered by [TheMealDB](https://www.themealdb.com/)** - An open, crowd-sourced database of recipes from around the world!

## 🍽️ Features

- **Meal Search**: Search for meals by name
- **Meal Details**: Get complete recipe details including ingredients and instructions
- **Random Meals**: Get random meal suggestions
- **Category Browsing**: Explore meal categories and get meals by category
- **Ingredient Search**: Find meals by specific ingredients
- **Comprehensive Data**: Access to thousands of recipes from around the world

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A compatible MCP client (like Cursor with MCP support)
- **Docker & Docker Compose** (optional, for containerized deployment)

### Local Installation (Recommended for most users)

1. **Clone or download this project**
   ```bash
   git clone <your-repo-url>
   cd mealdb-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the server**
   ```bash
   npm run build
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The server will start and listen for MCP requests via stdio.

### 🐳 Docker Installation (Optional)

For a containerized setup (requires Docker Desktop to be installed):

1. **Production deployment**
   ```bash
   npm run docker:prod
   ```

2. **Development with hot reload**
   ```bash
   npm run docker:dev
   ```

**Note:** If you get a "'docker-compose' is not recognized" error, Docker isn't installed. Use the local installation method above instead.

## 🔧 Configuration

### For Cursor IDE

The server includes a `.cursor/mcp.json` configuration file that allows Cursor to automatically discover and use the MealDB server.

```json
{
  "mcpServers": {
    "mealdb-server": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### For Other MCP Clients

Configure your MCP client to connect to this server using:
- **Command**: `node`
- **Arguments**: `["path/to/mealdb-mcp/build/index.js"]`
- **Working Directory**: `path/to/mealdb-mcp`

## 🛠️ Available Tools

The MealDB MCP server provides the following tools:

### 1. `search_meals`
Search for meals by name.

**Parameters:**
- `query` (string): Name of the meal to search for

**Example:**
```json
{
  "name": "search_meals",
  "arguments": {
    "query": "chicken"
  }
}
```

### 2. `get_meal_details`
Get detailed information about a specific meal by ID.

**Parameters:**
- `mealId` (string): The ID of the meal to get details for

**Example:**
```json
{
  "name": "get_meal_details",
  "arguments": {
    "mealId": "52772"
  }
}
```

### 3. `get_random_meal`
Get a random meal suggestion.

**Parameters:** None

**Example:**
```json
{
  "name": "get_random_meal",
  "arguments": {}
}
```

### 4. `list_categories`
Get all available meal categories.

**Parameters:** None

**Example:**
```json
{
  "name": "list_categories",
  "arguments": {}
}
```

### 5. `search_by_ingredient`
Find meals that contain a specific ingredient.

**Parameters:**
- `ingredient` (string): Name of the ingredient to search for

**Example:**
```json
{
  "name": "search_by_ingredient",
  "arguments": {
    "ingredient": "chicken"
  }
}
```

## 💬 Usage Examples

Here are some example queries you can ask an AI assistant using this MCP server:

- *"Find me some chicken recipes"*
- *"Get details for meal ID 52772"*
- *"Give me a random meal suggestion"*
- *"What meal categories are available?"*
- *"Find meals that contain tomatoes"*
- *"Show me Italian recipes"*
- *"What are some vegetarian options?"*

## 🏗️ Development

### Project Structure

```
mealdb-mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── build/                # Compiled JavaScript output
├── .cursor/
│   └── mcp.json         # Cursor IDE configuration
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

### Scripts

**Local Development:**
- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and recompile
- `npm start` - Start the MCP server
- `npm run prepare` - Build the project (runs automatically on install)

**Docker Commands:**
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run container from built image
- `npm run docker:dev` - Start development environment with hot reload
- `npm run docker:prod` - Start production environment
- `npm run docker:stop` - Stop all containers
- `npm run docker:logs` - View container logs
- `npm run docker:clean` - Clean up containers and images

### API Information

This server uses the free tier of [TheMealDB API](https://www.themealdb.com/api.php) which provides:
- Meal search by name
- Meal details by ID
- Random meal suggestions
- Category listings
- Ingredient-based filtering
- Area/cuisine filtering

**Note**: This server only uses free API endpoints. Premium features are not implemented.

## 🐳 Docker Deployment

### Container Features

- **Multi-stage build** for optimized production images
- **Non-root user** for enhanced security
- **Health checks** for container monitoring
- **Alpine Linux** base for minimal image size
- **Development mode** with hot reload support

### Production Deployment

```bash
# Build and start in production mode
docker-compose up -d

# View logs
docker-compose logs -f mealdb-mcp-server

# Stop services
docker-compose down
```

### Development Deployment

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up

# Or use the npm script
npm run docker:dev
```

### Container Configuration

The Docker setup includes:

- **Production container**: Optimized, multi-stage build
- **Development container**: Hot reload, volume mounting
- **Health checks**: Automatic container health monitoring
- **Network isolation**: Dedicated Docker networks
- **Volume management**: Persistent data and logs

### Environment Variables

Configure the container using environment variables:

```bash
NODE_ENV=production          # Environment mode
PORT=3000                   # Server port
```

### Docker Commands Reference

```bash
# Build image manually
docker build -t mealdb-mcp-server .

# Run container manually
docker run -p 3000:3000 mealdb-mcp-server

# Execute commands in running container
docker exec -it mealdb-mcp-server /bin/sh

# View container logs
docker logs mealdb-mcp-server

# Stop and remove container
docker stop mealdb-mcp-server
docker rm mealdb-mcp-server
```

## 🔒 Security

- The server runs locally and doesn't expose any network ports
- All API calls are made to the public TheMealDB API
- No sensitive data is stored or transmitted
- Uses secure HTTPS connections to external APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TheMealDB](https://www.themealdb.com/) for providing the free recipe API
- [Model Context Protocol](https://modelcontextprotocol.io/) for the standardized AI-assistant communication protocol
- [Anthropic](https://www.anthropic.com/) for developing MCP

## 📞 Support & Help

### 🆘 Need Help?

We're here to help you get the most out of your MealDB MCP Server! If you encounter any issues or have questions, here are your options:

**📧 Get Support:**
- 🐛 **Found a bug?** Open an issue in our [GitHub repository](https://github.com/your-repo/mealdb-mcp)
- 💡 **Have a feature request?** We'd love to hear your ideas!
- ❓ **Need help with setup?** Check our troubleshooting guide below or ask for help

**🔗 Useful Links:**
- 📖 [TheMealDB API Documentation](https://www.themealdb.com/api.php)
- 🏠 [TheMealDB Website](https://www.themealdb.com/)
- 📋 [Model Context Protocol Documentation](https://modelcontextprotocol.io/)

### Common Issues & Solutions

**"'docker-compose' is not recognized" Error:**

If you see this error when running `npm run docker:prod`, it means Docker isn't installed on your system. You have two options:

1. **Install Docker Desktop** (recommended for containerized deployment):
   - Download from https://www.docker.com/products/docker-desktop/
   - Install and restart your computer
   - Verify with `docker --version` and `docker compose version`

2. **Run locally without Docker** (simpler setup):
   ```bash
   npm install
   npm run build
   npm start
   ```

**Build or Runtime Issues:**

1. ✅ Check that Node.js 18+ is installed (`node --version`)
2. ✅ Ensure all dependencies are installed (`npm install`)
3. ✅ Verify the build completed successfully (`npm run build`)
4. ✅ Check that your MCP client is configured correctly
5. ✅ Make sure you're in the correct directory
6. ✅ Try clearing node_modules and reinstalling: `rm -rf node_modules package-lock.json && npm install`

**Still having trouble?** Don't hesitate to reach out - we're happy to help! 🤝

---

**Happy Cooking! 🍳**

**Made with ❤️ by Traves Theberge**
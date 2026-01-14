import path from 'path'
import CopyPlugin from 'copy-webpack-plugin'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    content: './src/content/index.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'content.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: '.' }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
}

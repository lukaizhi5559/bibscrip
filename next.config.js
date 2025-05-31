/** @type {import('next').NextConfig} */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // Add the mini-css-extract-plugin
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      })
    );

    // Handle CSS processing
    const cssRule = config.module.rules.find((rule) => 
      rule.test && rule.test.toString().includes('css')
    );
    
    if (cssRule) {
      // Make sure we're using the MiniCssExtractPlugin loader
      cssRule.use = [
        isServer ? { loader: 'ignore-loader' } : MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader',
      ];
    }

    return config;
  },
};

module.exports = nextConfig;

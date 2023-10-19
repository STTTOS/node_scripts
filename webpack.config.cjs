const path = require("path");
const fs = require("fs");

const includeExtname = [".ts", ".tsx"];
/**
 * @description 获取src/scripts下的所有脚本文件, 并且格式化为 { scriptone: 'path', ... }
 * @returns {}
 */
function getEntries() {
  const srcPath = path.resolve(__dirname, "src/scripts");
  const files = fs.readdirSync(srcPath);

  return files
    .filter((file) => includeExtname.includes(path.extname(file)))
    .reduce(
      (acc, file) => ({
        ...acc,
        [path.basename(file, path.extname(file))]: path.join(srcPath, file),
      }),
      {}
    );
}

const { MODE } = process.env;
const modeMap = new Map([
  ["dev", "development"],
  ["prd", "production"],
]);
module.exports = {
  // If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
  // or disable the default devtool with "devtool: false".
  devtool: false,
  mode: modeMap.get(MODE),
  entry: getEntries(), // 多个入口文件
  output: {
    path: path.resolve(__dirname, "dist"), // 输出目录
    filename: "[name].js", // 使用原始文件名作为输出文件名
    clean: true, // 在每次构建前清理输出目录
  },
  resolve: {
    extensions: [".ts", ".js"], // 解析的文件扩展名
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // 匹配 TypeScript 文件
        use: "ts-loader", // 使用 ts-loader 进行编译
        exclude: /node_modules/, // 排除 node_modules 目录
      },
    ],
  },
  // using node webpack will compile for usage in a Node.js-like environment
  // (uses Node.js require to load chunks and not touch any built in modules like fs or path).
  // 指定构建目标为 Node.js 环境
  target: "node",
};

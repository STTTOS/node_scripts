import path, { extname } from "path";
import { readdir, readFile, stat, writeFile } from "fs/promises";

interface FindAllFilesOptions {
  /**
   * 制定读取文件后缀
   */
  ext: string[];
  /**
   * 排除指定文件夹
   */
  excludes: string[];
}

/**
 *
 * @description 根据入口path, 获取所有文件绝对路径
 * @param entry 入口file path
 * @param options
 * @returns string[]
 */
export async function findAddFiles(
  entry: string,
  options: FindAllFilesOptions
) {
  const { ext, excludes } = options;
  const results: string[] = [];
  await _readAllFiles(entry);

  return results;
  async function _readAllFiles(directoryPath: string) {
    const files = await readdir(directoryPath);

    for (const filename of files) {
      // 排除指定的文件夹 以及隐藏文件夹
      if (excludes.includes(filename) || filename.startsWith(".")) return;

      // 完整文件路径
      const filePath = path.join(directoryPath, filename);
      const stats = await stat(filePath);
      // 如果是文件
      if (stats.isFile()) {
        if (!ext.includes(extname(filename)) || filePath.startsWith("."))
          return;

        results.push(filePath);
      } else if (stats.isDirectory()) {
        await _readAllFiles(filePath);
      }
    }
  }
}

/**
 * @description 替换匹配到规则的域名
 * @param input
 */
export function replaceDomain(input: string) {
  const reg = new RegExp(`(\\w+)-(qa|dev).(yzw).cn(.qa)?`, "ig");
  return input.replace(reg, (_, business, env, company) => {
    return `${business}.${company}${env}.cn`;
  });
}

const args = process.argv.slice(2);
async function exec() {
  const filePaths = await findAddFiles(path.resolve(__dirname, args[0]), {
    ext: [".js", ".jsx", ".ts", ".tsx", ".json"],
    excludes: ["node_modules"],
  });

  for (const filePath of filePaths) {
    const content = await readFile(filePath, "utf-8");
    const newContent = replaceDomain(content);
    await writeFile(filePath, newContent, "utf-8");
  }
}
exec();

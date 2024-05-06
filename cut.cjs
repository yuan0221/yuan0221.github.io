const fs = require('fs');
const path = require('path');

// 定义源文件夹和目标文件夹路径
const sourceDir = './src/content/draft';
const targetDir = './src/content/posts';

// 获取源文件夹中的所有文件列表
fs.readdir(sourceDir, (err, files) => {
  if (err) {
    console.error('读取源文件夹失败：', err);
    return;
  }

  // 遍历源文件夹中的每个文件
  files.forEach(file => {
    // 构建源文件的完整路径
    const sourceFile = path.join(sourceDir, file);
    // 构建目标文件的完整路径
    const targetFile = path.join(targetDir, file);

    // 使用 fs.rename() 将文件从源路径移动到目标路径
    fs.rename(sourceFile, targetFile, err => {
      if (err) {
        console.error(`移动文件 ${sourceFile} 到 ${targetFile} 失败：`, err);
      } else {
        console.log(`文件 ${sourceFile} 已成功移动到 ${targetFile}`);
      }
    });
  });
});

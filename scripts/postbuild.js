#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const BASE_PATH = '/Save-Oneself';

/**
 * Добавляет префикс к статическим ресурсам в index.html
 */
function addPrefixToStaticAssets() {
  const indexPath = path.join(process.cwd(), 'docs', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Файл docs/index.html не найден!');
    process.exit(1);
  }

  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Регулярные выражения для поиска статических ресурсов
    const patterns = [
      // CSS файлы: href="/assets/..."
      { 
        regex: /href="\/assets\//g, 
        replacement: `href="${BASE_PATH}/assets/` 
      },
      // JS файлы: src="/assets/..."
      { 
        regex: /src="\/assets\//g, 
        replacement: `src="${BASE_PATH}/assets/` 
      },
      // Другие статические ресурсы (изображения, иконки и т.д.)
      { 
        regex: /href="\/(?!\/)([^"]*\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot))"/g, 
        replacement: `href="${BASE_PATH}/$1"` 
      },
      { 
        regex: /src="\/(?!\/)([^"]*\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot))"/g, 
        replacement: `src="${BASE_PATH}/$1"` 
      }
    ];

    let hasChanges = false;
    
    // Применяем каждое регулярное выражение
    patterns.forEach(({ regex, replacement }) => {
      const originalContent = content;
      content = content.replace(regex, replacement);
      if (content !== originalContent) {
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(indexPath, content, 'utf8');
      console.log('✅ Успешно добавлен префикс к статическим ресурсам в docs/index.html');
    } else {
      console.log('ℹ️  Изменения не требуются - префикс уже присутствует или статические ресурсы не найдены');
    }

  } catch (error) {
    console.error('❌ Ошибка при обработке файла:', error.message);
    process.exit(1);
  }
}

// Запускаем скрипт
console.log('🔧 Добавление префикса к статическим ресурсам...');
addPrefixToStaticAssets();
console.log('✨ Готово!');

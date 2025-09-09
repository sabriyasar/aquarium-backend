const fs = require("fs");
const jsonData = require("./categories.json");

// Recursive alt kategori çıkarma
function extractSubCategories(nodes) {
  const subs = [];
  if (!nodes) return subs;

  nodes.forEach((node) => {
    const subCategory = {
      Id: node.Id,
      Name: node.Name,
      Commission: node.Commission,
      subCategories: extractSubCategories(node.Nodes), // derine in
    };
    subs.push(subCategory);
  });

  return subs;
}

function extractCategories(data) {
  const result = [];

  data.forEach((item) => {
    if (item.ParentId === 0) {
      const mainCategory = {
        Id: item.Id,
        Name: item.Name,
        subCategories: extractSubCategories(item.Nodes), // recursive
      };
      result.push(mainCategory);
    }
  });

  return result;
}

const categories = extractCategories(jsonData);

fs.writeFileSync("result.json", JSON.stringify(categories, null, 2), "utf8");
console.log("✅ Tüm kategoriler result.json dosyasına kaydedildi.");

/* // category-parse.js
const fs = require("fs");
const jsonData = require("./categories.json"); // JSON dosyanın yolu

// Ana kategori ve alt kategorileri ayıran fonksiyon
function extractCategories(data) {
  const result = [];

  data.forEach((item) => {
    if (item.ParentId === 0) {
      // Ana kategori
      const mainCategory = {
        Id: item.Id,
        Name: item.Name,
        subCategories: [],
      };

      if (item.Nodes) {
        item.Nodes.forEach((sub) => {
          // Alt kategori ve komisyon
          mainCategory.subCategories.push({
            Id: sub.Id,
            Name: sub.Name,
            Commission: sub.Commission,
          });
        });
      }

      result.push(mainCategory);
    }
  });

  return result;
}

const categories = extractCategories(jsonData);

// Sonucu dosyaya yaz
fs.writeFileSync("result.json", JSON.stringify(categories, null, 2), "utf8");

console.log("✅ Kategoriler result.json dosyasına kaydedildi.");
 */
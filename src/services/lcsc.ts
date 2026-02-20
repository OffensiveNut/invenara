export interface LCSCProduct {
  partNumber: string;
  lcscPartNumber: string;
  manufacturer: string;
  description: string;
  package: string;
  packaging: string;
  inStock: number;
  datasheet?: string;
}

export async function searchLCSC(query: string): Promise<LCSCProduct[]> {
  try {
    // Try using api.allorigins.win as CORS proxy (get endpoint returns JSON)
    const lcscUrl = `https://www.lcsc.com/search?q=${encodeURIComponent(query)}`;
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(lcscUrl)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const html = data.contents;
    console.log('LCSC HTML length:', html.length);
    
    const products: LCSCProduct[] = [];
    
    // Parse HTML to extract product information
    // Look for product rows with productId
    const productRegex = /<tr[^>]*id="productId\d+"[^>]*>[\s\S]*?<\/tr>/g;
    const matches = html.match(productRegex);
    
    console.log('Found product rows:', matches ? matches.length : 0);
    
    if (!matches) {
      console.log('No product rows found in HTML');
      return [];
    }
    
    for (let i = 0; i < Math.min(matches.length, 10); i++) {
      const rowHTML = matches[i];
      
      try {
        // Extract ALL td elements from the row
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
        const cells: string[] = [];
        let cellMatch;
        
        while ((cellMatch = tdRegex.exec(rowHTML)) !== null) {
          cells.push(cellMatch[1]);
        }
        
        console.log('Found cells:', cells.length);
        console.log('Cell 0 preview:', cells[0]?.substring(0, 100));
        console.log('Cell 1 preview:', cells[1]?.substring(0, 100));
        console.log('Cell 6 preview:', cells[6]?.substring(0, 100));
        console.log('Cell 7 preview:', cells[7]?.substring(0, 100));
        console.log('Cell 8 preview:', cells[8]?.substring(0, 100));
        
        // Cell 0: Checkbox (skip)
        // Cell 1: MPN - Part Number and LCSC Number
        let partNumber = '';
        let lcscPartNumber = '';
        
        if (cells[1]) {
          const mpnMatch = cells[1].match(/<a[^>]*title="([^"]*)"[^>]*class="font-Bold-600 v2-a"[^>]*><span[^>]*>(?:<span[^>]*>([^<]*)<\/span>)?([^<]*)<\/span><\/a>/s);
          if (mpnMatch) {
            const highlighted = mpnMatch[2] || '';
            const rest = mpnMatch[3] || '';
            partNumber = (highlighted + rest).trim() || mpnMatch[1];
          }
          
          const lcscMatch = cells[1].match(/title="(C\d+)"[^>]*class="font-Bold-600 major--text v2-a"/);
          if (lcscMatch) {
            lcscPartNumber = lcscMatch[1];
          }
        }
        
        // Cell 2: Manufacturer
        let manufacturer = '';
        if (cells[2]) {
          const mfgMatch = cells[2].match(/<a[^>]*title="([^"]*)"[^>]*class="line-height-lowest v2-a"/);
          if (mfgMatch) {
            manufacturer = mfgMatch[1];
          }
        }
        
        // Cell 3: Availability (Stock)
        let inStock = 0;
        if (cells[3]) {
          const stockMatch = cells[3].match(/<span[^>]*class="font-Bold-600"[^>]*>(\d+)<\/span>/);
          if (stockMatch) {
            inStock = parseInt(stockMatch[1], 10);
          }
        }
        
        // Cell 4: Pricing (skip)
        // Cell 5: Quantity (skip)
        
        // Cell 6: Description
        let description = '';
        if (cells[6]) {
          const descMatch = cells[6].match(/<div[^>]*title="([^"]*)"[^>]*class="ellipsis-6"[^>]*>/);
          if (descMatch) {
            description = descMatch[1].replace(/&amp;/g, '&');
          }
        }
        
        // Cell 7: Package
        let packageValue = '';
        if (cells[7]) {
          const pkgMatch = cells[7].match(/<span[^>]*>([^<]+)<\/span>/);
          if (pkgMatch) {
            packageValue = pkgMatch[1].trim();
          }
        }
        
        // Cell 8: Packaging
        let packagingValue = '';
        if (cells[8]) {
          const packagingMatch = cells[8].match(/<span[^>]*>([^<]+)<\/span>/);
          if (packagingMatch) {
            packagingValue = packagingMatch[1].replace(/&amp;/g, '&').trim();
          }
        }
        
        // Extract datasheet from cell 1 (MPN cell)
        let datasheet = '';
        if (cells[1]) {
          const datasheetMatch = cells[1].match(/href="((?:https:\/\/www\.lcsc\.com)?\/datasheet\/[^"]*)"/);
          if (datasheetMatch) {
            datasheet = datasheetMatch[1].startsWith('http') 
              ? datasheetMatch[1] 
              : `https://www.lcsc.com${datasheetMatch[1]}`;
          }
        }
        
        console.log('Parsed product:', { 
          partNumber, 
          lcscPartNumber, 
          manufacturer, 
          inStock,
          packageValue, 
          packagingValue,
          description: description.substring(0, 50) + '...' 
        });
        
        if (partNumber && lcscPartNumber) {
          products.push({
            partNumber,
            lcscPartNumber,
            manufacturer,
            description,
            package: packageValue,
            packaging: packagingValue,
            inStock,
            datasheet,
          });
        }
      } catch (err) {
        console.error('Error parsing product row:', err);
      }
    }
    
    console.log('Total products parsed:', products.length);
    return products;
  } catch (error) {
    console.error('Error searching LCSC:', error);
    return [];
  }
}

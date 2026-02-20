import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface OldApiComponent {
  id_barang: number;
  part_number: string;
  manufacturer: string;
  label: string;
  package: string;
  packaging: string;
  stock: number;
  min_stock: number;
  description: string;
  datasheet_link: string;
  location_code: string;
  alt_name: string;
  price: number;
}

async function migrateData() {
  console.log('🚀 Starting migration from old API...\n');
  
  try {
    // Fetch data from old API
    console.log('📥 Fetching data from https://krill-willing-moderately.ngrok-free.app/barang');
    const response = await fetch('https://krill-willing-moderately.ngrok-free.app/barang', {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const oldData: OldApiComponent[] = await response.json();
    console.log(`✅ Fetched ${oldData.length} components from old API\n`);

    if (oldData.length === 0) {
      console.log('⚠️  No data to migrate');
      return;
    }

    // Show sample data
    console.log('📋 Sample component:');
    console.log(JSON.stringify(oldData[0], null, 2));
    console.log('\n');

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ part_number: string; error: string }> = [];

    for (let i = 0; i < oldData.length; i++) {
      const oldComponent = oldData[i];
      try {
        // Map location_code to Shelf format (C1 -> Shelf C1)
        const location = oldComponent.location_code ? `Shelf ${oldComponent.location_code}` : 'Shelf A1';

        // Insert component
        const { data: newComponent, error: componentError } = await (supabase as any)
          .from('components')
          .insert({
            part_number: oldComponent.part_number,
            manufacturer: oldComponent.manufacturer,
            type: oldComponent.label || 'Unknown',
            package: oldComponent.package || 'N/A',
            packaging: oldComponent.packaging || 'N/A',
            stock: oldComponent.stock || 0,
            min_stock: oldComponent.min_stock || 0,
            description: oldComponent.description || '',
            datasheet_url: oldComponent.datasheet_link || '',
            location: location,
          })
          .select()
          .single();

        if (componentError) {
          errors.push({ 
            part_number: oldComponent.part_number, 
            error: componentError.message 
          });
          errorCount++;
          process.stdout.write(`❌ `);
          continue;
        }

        successCount++;
        process.stdout.write(`✅ `);
        
        // Print progress every 50 components
        if ((successCount + errorCount) % 50 === 0) {
          console.log(`\n   Progress: ${successCount + errorCount}/${oldData.length}`);
        }
      } catch (error: any) {
        errors.push({ 
          part_number: oldComponent.part_number, 
          error: error.message 
        });
        errorCount++;
        process.stdout.write(`❌ `);
      }
    }

    console.log('\n\n🎉 Migration complete!');
    console.log(`✅ Successfully migrated: ${successCount} components`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} components`);
      console.log('\n📝 First 10 errors:');
      errors.slice(0, 10).forEach(({ part_number, error }) => {
        console.log(`   • ${part_number}: ${error}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

migrateData()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(() => {
    console.log('\n💥 Migration failed!');
    process.exit(1);
  });

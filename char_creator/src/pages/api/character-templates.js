import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const templatesDir = path.join(process.cwd(), 'public', 'character_templates');

    // Check if directory exists
    try {
      await fs.access(templatesDir);
    } catch {
      // Directory doesn't exist, return empty array
      return res.status(200).json([]);
    }

    const files = await fs.readdir(templatesDir);
    
    // Get all JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      return res.status(200).json([]);
    }

    // Process each template
    const templates = await Promise.all(
      jsonFiles.map(async jsonFile => {
        try {
          const content = await fs.readFile(path.join(templatesDir, jsonFile), 'utf8');
          const templateData = JSON.parse(content);
          
          // Check for matching image file
          const baseName = jsonFile.replace('.json', '');
          const imageFile = files.find(file => 
            file.startsWith(baseName) && 
            (file.endsWith('.jpg') || file.endsWith('.png'))
          );
          
          return {
            ...templateData,
            id: baseName,
            imageUrl: imageFile ? `/character_templates/${imageFile}` : null
          };
        } catch (err) {
          console.error(`Error processing template ${jsonFile}:`, err);
          return null;
        }
      })
    );

    // Filter out any failed templates
    const validTemplates = templates.filter(Boolean);
    res.status(200).json(validTemplates);

  } catch (error) {
    console.error('Error loading templates:', error);
    // Return empty array instead of error to handle gracefully on client
    res.status(200).json([]);
  }
}

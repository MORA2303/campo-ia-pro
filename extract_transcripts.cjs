const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Big\\.gemini\\antigravity\\brain';
const outputDir = path.join(__dirname, 'src', 'data');
const outputFile = path.join(outputDir, 'antigravityChats.json');

const knownTitles = {
  '6ab82854-ea7c-4238-aa05-62c673a17fe2': 'Configuración de Entorno de Desarrollo y Login',
  '8929fd52-2275-4d5d-a7e0-318020dc95fa': 'Auditoría de Requerimientos y Migración a Supabase',
  '84def171-3794-40ea-9f5b-fb30d22d7aae': 'Análisis del Alcance del Proyecto Campo-IA-Pro',
  'cafe81dc-228a-49c4-8a95-f40b1f0ca0bf': 'Definición de Gestión de Usuarios y Conexión de Supabase',
  '5dce78b3-a246-4005-8daf-7249b7837350': 'Resolución de Errores de Dependencias',
  'b31cb5fa-7bc5-4d7d-8e4a-ef259ae301bf': 'Análisis del Alcance de Agrosense-AI',
  'e3f55ddf-ae6b-47b8-a46c-b56654160cb7': 'Recuperación de Conversaciones de Antigravity'
};

function cleanUserContent(content) {
  if (!content) return '';
  let cleaned = content;
  // Remove XML-like tags
  cleaned = cleaned.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/g, '$1');
  cleaned = cleaned.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '');
  cleaned = cleaned.replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, '');
  cleaned = cleaned.replace(/<user_information>[\s\S]*?<\/user_information>/g, '');
  cleaned = cleaned.replace(/<subagents>[\s\S]*?<\/subagents>/g, '');
  cleaned = cleaned.replace(/<artifacts>[\s\S]*?<\/artifacts>/g, '');
  cleaned = cleaned.replace(/<slash_commands>[\s\S]*?<\/slash_commands>/g, '');
  return cleaned.trim();
}

function parseTranscript(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  const messages = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      const { source, type, content, created_at } = entry;
      const timestamp = created_at || new Date().toISOString();

      if (source === 'USER_EXPLICIT' || type === 'USER_INPUT') {
        const cleaned = cleanUserContent(content);
        if (cleaned) {
          messages.push({
            sender: 'user',
            content: cleaned,
            timestamp
          });
        }
      } else if (source === 'MODEL') {
        if (content && typeof content === 'string' && content.trim()) {
          messages.push({
            sender: 'model',
            content: content.trim(),
            timestamp
          });
        } else if (entry.tool_calls && entry.tool_calls.length > 0) {
          // If the model did code changes or ran commands, let's represent it nicely
          const calls = entry.tool_calls.map(tc => {
            const name = tc.name || '';
            const args = tc.args || {};
            if (name === 'run_command') {
              return `Ejecutó comando: \`${args.CommandLine || ''}\``;
            } else if (name === 'write_to_file' || name === 'replace_file_content' || name === 'multi_replace_file_content') {
              const file = args.TargetFile ? path.basename(args.TargetFile) : 'archivo';
              return `Modificó el archivo: \`${file}\``;
            }
            return null;
          }).filter(Boolean);

          if (calls.length > 0) {
            messages.push({
              sender: 'system',
              content: `🔧 Antigravity realizó acciones:\n${calls.map(c => `• ${c}`).join('\n')}`,
              timestamp
            });
          }
        }
      }
    } catch (e) {
      // Ignore invalid JSON lines
    }
  }

  return messages;
}

function run() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const dirs = fs.readdirSync(brainDir);
  const sessions = [];

  for (const dirName of dirs) {
    const dirPath = path.join(brainDir, dirName);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    if (dirName === 'tempmediaStorage') continue;

    let transcriptPath = path.join(dirPath, '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(transcriptPath)) {
      transcriptPath = path.join(dirPath, '.system_generated', 'logs', 'overview.txt');
    }
    if (!fs.existsSync(transcriptPath)) continue;

    console.log(`Procesando chat: ${dirName}`);
    const messages = parseTranscript(transcriptPath);

    if (messages.length === 0) continue;

    // Get date of the first message
    const firstMsg = messages[0];
    const dateObj = new Date(firstMsg.timestamp);
    const dateStr = dateObj.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Determine title
    let title = knownTitles[dirName];
    if (!title) {
      const firstUserMsg = messages.find(m => m.sender === 'user');
      if (firstUserMsg) {
        title = firstUserMsg.content.substring(0, 50);
        if (firstUserMsg.content.length > 50) title += '...';
      } else {
        title = `Conversación del ${dateStr}`;
      }
    }

    sessions.push({
      id: dirName,
      title,
      date: dateStr,
      timestamp: dateObj.getTime(),
      messages
    });
  }

  // Sort sessions chronologically (newest first)
  sessions.sort((a, b) => b.timestamp - a.timestamp);

  fs.writeFileSync(outputFile, JSON.stringify(sessions, null, 2), 'utf8');
  console.log(`¡Transcripts extraídos con éxito! Guardados en: ${outputFile}`);
}

run();

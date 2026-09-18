const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

const regex = /const speakText = \(text: string\) => \{[\s\S]*?\};\n\s*const stopSpeaking = \(\) => \{[\s\S]*?\};/m;

const replacement = `
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopSpeaking = () => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch (e) {}
      currentAudioSourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    // Clean text from emojis and markdown
    const cleanText = text.replace(/([\\u2700-\\u27BF]|[\\uE000-\\uF8FF]|\\uD83C[\\uDC00-\\uDFFF]|\\uD83D[\\uDC00-\\uDFFF]|[\\u2011-\\u26FF]|\\uD83E[\\uDD10-\\uDDFF])/g, '').replace(/\\*\\*/g, '');
    if (!cleanText) return;
    
    const isArabicText = /[\\u0600-\\u06FF]/.test(cleanText);
    const lang = isArabicText ? 'ar-SA' : 'en-US';

    stopSpeaking(); // Stop any ongoing speech

    setIsSpeaking(true);
    try {
      const res = await fetch('/api/ai-chat/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, lang })
      });
      const data = await res.json();
      
      if (data.audioData) {
        // Initialize AudioContext if not already initialized or if closed
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const audioBuffer = await audioContextRef.current.decodeAudioData(
          // Convert base64 to ArrayBuffer
          Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0)).buffer
        );
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          setIsSpeaking(false);
        };
        currentAudioSourceRef.current = source;
        source.start(0);
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error('TTS playback error', e);
      setIsSpeaking(false);
    }
  };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/Chatbot.tsx', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');

// Use functional state update and a ref to get the latest messages for the API call
code = code.replace(
  /const sendMessageFromInput = async \(textToSend: string\) => \{/,
  `const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const sendMessageFromInput = async (textToSend: string) => {`
);

code = code.replace(
  /const newMessages = \[\.\.\.messages, \{ role: 'user' as const, content: textToSend \}\];\n\s*setMessages\(newMessages\);/,
  `const newMessages = [...messagesRef.current, { role: 'user' as const, content: textToSend }];
    setMessages(prev => [...prev, { role: 'user' as const, content: textToSend }]);`
);

// We need to re-assign recognitionRef.current.onresult in an effect that depends on sendMessageFromInput!
// But wait, it's easier to just use the latest `sendMessageFromInput` by having it not depend on stale closures.
// The ref `messagesRef` solves the stale closure issue because `messagesRef.current` is always up to date!

fs.writeFileSync('src/components/Chatbot.tsx', code);

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const RecorderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  background: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
  
  &.recording {
    border-color: var(--color-error);
    background: rgba(220, 53, 69, 0.05);
  }
  
  &.processing {
    border-color: var(--color-warning);
    background: rgba(255, 193, 7, 0.05);
  }
`;

const RecordButton = styled(motion.button)`
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  border: none;
  background: ${props => {
    if (props.isRecording) return 'var(--color-error)';
    if (props.isProcessing) return 'var(--color-warning)';
    return 'var(--gradient-primary)';
  }};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-lg);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-xl);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusText = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-align: center;
`;

const DurationDisplay = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  font-family: 'Monaco', 'Menlo', monospace;
`;

const Controls = styled.div`
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
`;

const ControlButton = styled.button`
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--color-surface-variant);
    border-color: var(--color-primary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AudioPlayer = styled.div`
  width: 100%;
  max-width: 300px;
  
  audio {
    width: 100%;
    height: 40px;
    border-radius: var(--radius-md);
  }
`;

const TranscriptionBox = styled.div`
  width: 100%;
  max-width: 500px;
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
`;

const TranscriptionText = styled.div`
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text);
  white-space: pre-wrap;
  min-height: 60px;
`;

const TranscriptionLabel = styled.div`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const VoiceRecorder = ({ onTranscription, onAudioData, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check for browser support
  const isSupported = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    if (!isSupported) {
      setError('Voice recording is not supported in your browser');
      return;
    }

    try {
      setError(null);
      setTranscription(''); // Clear previous transcription
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition for real-time transcription
      startSpeechRecognition();
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (onAudioData) {
          onAudioData(audioBlob);
        }
        
        // Stop speech recognition
        stopSpeechRecognition();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start duration counter
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const startSpeechRecognition = () => {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge for voice transcription.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      let completeTranscript = '';
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsProcessing(false);
      };
      
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript + ' ';
          } else {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        
        completeTranscript = currentTranscript;
        setTranscription(currentTranscript);
        console.log('Current transcription:', currentTranscript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setError('Speech recognition error. Please try again.');
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended, final transcript:', completeTranscript);
        if (completeTranscript && completeTranscript.trim() && onTranscription) {
          onTranscription(completeTranscript.trim());
        }
        recognitionRef.current = null;
      };
      
      // Start recognition
      recognitionRef.current.start();
      
    } catch (error) {
      console.error('Error setting up speech recognition:', error);
      setError('Error setting up speech recognition. Please try again.');
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setTranscription('');
    setDuration(0);
    setError(null);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <RecorderContainer>
        <StatusText>Voice recording is not supported in your browser</StatusText>
      </RecorderContainer>
    );
  }

  return (
    <RecorderContainer className={`${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}>
      <RecordButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isProcessing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isProcessing ? '⏳' : isRecording ? '⏹️' : '🎤'}
      </RecordButton>

      <StatusText>
        {isProcessing 
          ? 'Processing audio...' 
          : isRecording 
            ? 'Recording... Click to stop' 
            : 'Click to start recording'
        }
      </StatusText>

      {(isRecording || duration > 0) && (
        <DurationDisplay>
          {formatDuration(duration)}
        </DurationDisplay>
      )}

      {error && (
        <StatusText style={{ color: 'var(--color-error)' }}>
          {error}
        </StatusText>
      )}

      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ width: '100%' }}
          >
            <AudioPlayer>
              <audio controls src={audioUrl} />
            </AudioPlayer>
            
            <Controls>
              <ControlButton onClick={clearRecording}>
                Clear
              </ControlButton>
            </Controls>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ width: '100%' }}
          >
            <TranscriptionBox>
              <TranscriptionLabel>Transcription</TranscriptionLabel>
              <TranscriptionText>{transcription}</TranscriptionText>
            </TranscriptionBox>
          </motion.div>
        )}
      </AnimatePresence>
    </RecorderContainer>
  );
};

export default VoiceRecorder;


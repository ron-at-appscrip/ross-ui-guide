import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onResult: (transcript: string) => void;
  onCancel: () => void;
  legalTerminologyMode?: boolean;
  maxDuration?: number; // in seconds
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'processing' | 'completed';

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onResult,
  onCancel,
  legalTerminologyMode = true,
  maxDuration = 300, // 5 minutes
  className,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Legal terminology mode adjustments
      if (legalTerminologyMode) {
        // This would be where you'd set custom vocabulary or models
        // For now, we'll just note the mode is enabled
      }

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
        setConfidence(event.results[event.results.length - 1]?.[0]?.confidence * 100 || 0);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setRecordingState('idle');
      };

      recognitionRef.current.onend = () => {
        if (recordingState === 'recording') {
          // Restart if still recording
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recordingState, legalTerminologyMode]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioUrlRef.current = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrlRef.current;
        }
        
        setRecordingState('completed');
      };
      
      mediaRecorderRef.current.start();
      recognitionRef.current?.start();
      
      setRecordingState('recording');
      setDuration(0);
      setTranscript('');
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      recognitionRef.current?.stop();
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      recognitionRef.current?.stop();
      setRecordingState('paused');
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      recognitionRef.current?.start();
      setRecordingState('recording');
      
      // Resume duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const resetRecording = () => {
    setRecordingState('idle');
    setDuration(0);
    setTranscript('');
    setConfidence(0);
    setIsPlaying(false);
    
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = '';
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrlRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onResult(transcript.trim());
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (duration / maxDuration) * 100;

  return (
    <div className={cn('w-full max-w-md mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Voice Input</h3>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Legal Mode Indicator */}
      {legalTerminologyMode && (
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">
            🏛️ Legal Terminology Mode Active
          </Badge>
        </div>
      )}

      {/* Recording Visualization */}
      <div className="text-center space-y-4">
        {/* Main Recording Button */}
        <div className="relative">
          <Button
            size="lg"
            className={cn(
              'w-20 h-20 rounded-full text-white transition-all duration-200',
              recordingState === 'recording' 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : recordingState === 'paused'
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-blue-500 hover:bg-blue-600'
            )}
            onClick={
              recordingState === 'idle' 
                ? startRecording
                : recordingState === 'recording' 
                ? pauseRecording
                : resumeRecording
            }
          >
            {recordingState === 'idle' && <Mic className="h-8 w-8" />}
            {recordingState === 'recording' && <Pause className="h-8 w-8" />}
            {recordingState === 'paused' && <Play className="h-8 w-8" />}
          </Button>
          
          {recordingState === 'recording' && (
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
          )}
        </div>

        {/* Duration and Progress */}
        <div className="space-y-2">
          <div className="text-lg font-mono font-semibold">
            {formatDuration(duration)}
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2" 
            max={100}
          />
          
          <div className="text-xs text-gray-500">
            Maximum: {formatDuration(maxDuration)}
          </div>
        </div>

        {/* Recording State */}
        <div className="text-sm text-gray-600">
          {recordingState === 'idle' && 'Click to start recording'}
          {recordingState === 'recording' && 'Recording... Click to pause'}
          {recordingState === 'paused' && 'Paused - Click to resume'}
          {recordingState === 'completed' && 'Recording completed'}
        </div>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Transcript:</label>
            {confidence > 0 && (
              <Badge variant={confidence > 80 ? 'default' : confidence > 60 ? 'secondary' : 'destructive'}>
                {Math.round(confidence)}% confidence
              </Badge>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 border rounded-lg text-sm">
            {transcript || 'Listening...'}
          </div>
        </div>
      )}

      {/* Audio Playback */}
      {recordingState === 'completed' && audioUrlRef.current && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Playback:</label>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={playAudio}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <audio 
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          {(recordingState === 'recording' || recordingState === 'paused') && (
            <Button size="sm" variant="outline" onClick={stopRecording}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
          
          {recordingState === 'completed' && (
            <Button size="sm" variant="outline" onClick={resetRecording}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          {transcript && (
            <Button size="sm" onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
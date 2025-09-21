import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/journal/RichTextEditor';
import VoiceRecorder from '../../components/journal/VoiceRecorder';
import MoodSelector from '../../components/journal/MoodSelector';
import CrisisAlert from '../../components/crisis/CrisisAlert';
import SelfHarmAlert from '../../components/security/SelfHarmAlert';
import { useAuth } from '../../contexts/AuthContext';
import { useMood } from '../../contexts/MoodContext';
import { useTheme } from '../../contexts/ThemeContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
`;

const Title = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  font-family: var(--font-family-heading);
`;

const NewEntryButton = styled(motion.button)`
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
  }
`;

const JournalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--spacing-6);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const EntryForm = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
`;

const FormTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  font-family: var(--font-family-heading);
`;

const FormActions = styled.div`
  display: flex;
  gap: var(--spacing-3);
`;

const ActionButton = styled.button`
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
  }

  &.primary {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);

    &:hover {
      background: var(--color-primary-dark);
    }
  }

  &.danger {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);

    &:hover {
      background: #c82333;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TitleInput = styled.input`
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  background: var(--color-background);
  margin-bottom: var(--spacing-4);
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const TagsInput = styled.input`
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-background);
  margin-bottom: var(--spacing-4);
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const EntriesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const EntryActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
  opacity: 0;
  transition: opacity var(--transition-fast);
`;

const EntryCard = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &:hover ${EntryActions} {
    opacity: 1;
  }
`;

const EntryTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
`;

const EntryPreview = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-3);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EntryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
`;

const EntryDate = styled.div``;

const EntryMood = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const EntriesSection = styled.div`
  h2 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--spacing-4);
    font-family: var(--font-family-heading);
  }
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-surface-variant);
    color: var(--color-text);
  }

  &.delete:hover {
    background: var(--color-error);
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-12);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-8);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const JournalPage = () => {
  const { user } = useAuth();
  const { setMoodTheme } = useTheme();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [crisisHelpline, setCrisisHelpline] = useState(null);
  const [showSelfHarmAlert, setShowSelfHarmAlert] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    mood: 'neutral',
    intensity: 5
  });

  // Check URL params for auto-opening new entry form
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('new') === 'true') {
      setIsCreating(true);
    }
  }, [location]);

  // Fetch journal entries
  const { data: entries, isLoading } = useQuery(
    'journal-entries',
    async () => {
      const response = await axios.get('/api/journal/entries');
      return response.data.data.entries;
    },
    {
      enabled: !!user
    }
  );

  // Create/Update entry mutation
  const saveEntryMutation = useMutation(
    async (entryData) => {
      if (editingEntry && (editingEntry._id || editingEntry.id)) {
        const entryId = editingEntry._id || editingEntry.id;
        console.log('Updating entry with ID:', entryId);
        const response = await axios.put(`/api/journal/entries/${entryId}`, entryData);
        return response.data;
      } else {
        console.log('Creating new entry');
        const response = await axios.post('/api/journal/entries', entryData);
        return response.data;
      }
    },
    {
      onSuccess: (data) => {
        toast.success(editingEntry ? 'Entry updated successfully' : 'Entry saved successfully');
        
        // Apply mood theme if available
        const detectedMood = data.data?.entry?.mood?.detected || data.data?.mood?.detected;
        if (detectedMood && detectedMood !== 'neutral') {
          console.log('JournalPage: Setting mood theme from journal entry:', detectedMood);
          setTimeout(() => {
            setMoodTheme(detectedMood);
          }, 100);
        } else {
          console.log('JournalPage: No mood detected or neutral mood:', detectedMood);
        }
        
        resetForm();
        setEditingEntry(null);
        queryClient.invalidateQueries(['journal-entries']);
        queryClient.invalidateQueries(['dashboard-stats']);
        queryClient.refetchQueries(['dashboard-stats']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save entry');
      }
    }
  );

  // Delete entry mutation
  const deleteEntryMutation = useMutation(
    async (entryId) => {
      console.log('Deleting entry with ID:', entryId);
      const response = await axios.delete(`/api/journal/entries/${entryId}`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log('Delete success:', data);
        toast.success('Entry deleted successfully');
        queryClient.invalidateQueries(['journal-entries']);
        queryClient.invalidateQueries(['dashboard-stats']);
        queryClient.refetchQueries(['journal-entries']);
        queryClient.refetchQueries(['dashboard-stats']);
      },
      onError: (error) => {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete entry');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: '',
      mood: 'neutral',
      intensity: 5
    });
    setEditingEntry(null);
    setIsCreating(false);
    setShowCrisisAlert(false);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    // Check for self-harm content before saving
    const selfHarmKeywords = [
      'hurt myself', 'kill myself', 'end it all', 'not worth living',
      'want to die', 'i want to die', 'suicide', 'self harm', 'cut myself', 'harm myself',
      'end my life', 'take my life', 'give up', 'no point', 'hopeless',
      'worthless', 'better off dead', 'can\'t go on', 'no reason to live'
    ];

    const contentLower = formData.content.toLowerCase();
    const titleLower = formData.title.toLowerCase();
    const hasSelfHarmContent = selfHarmKeywords.some(keyword => 
      contentLower.includes(keyword) || titleLower.includes(keyword)
    );

    if (hasSelfHarmContent) {
      setShowSelfHarmAlert(true);
      return;
    }

    const entryData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    saveEntryMutation.mutate(entryData);
    
    // Invalidate analytics queries to refresh data
    queryClient.invalidateQueries(['analytics']);
    queryClient.invalidateQueries(['mood-insights']);
    queryClient.invalidateQueries(['dashboard-stats']);
    queryClient.invalidateQueries(['user-stats']);
  };

  // Edit Function
  const handleNewEdit = (entry) => {
    if (!entry || (!entry._id && !entry.id)) {
      toast.error('Cannot edit entry - invalid entry data');
      return;
    }
    
    setEditingEntry(entry);
    setFormData({
      title: entry.title || '',
      content: entry.content || '',
      tags: entry.tags?.join(', ') || '',
      mood: entry.mood?.manual || entry.mood?.detected || 'neutral',
      intensity: entry.intensity || 5
    });
    setIsCreating(true);
    
    // Scroll to top when opening edit mode
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast.success('Entry loaded for editing');
  };

  // Delete Function
  const handleNewDelete = (entry) => {
    if (!entry || (!entry._id && !entry.id)) {
      toast.error('Cannot delete entry - invalid entry data');
      return;
    }
    
    if (window.confirm('Delete this journal entry permanently?')) {
      const entryId = entry._id || entry.id;
      deleteEntryMutation.mutate(entryId);
    }
  };

  const handleVoiceTranscription = (transcription) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + (prev.content ? '\n\n' : '') + transcription
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner>
          <Spinner />
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Journal</Title>
        <NewEntryButton
          onClick={() => {
            setIsCreating(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✍️ New Entry
        </NewEntryButton>
      </Header>

      <JournalGrid>
        <MainContent>
          <AnimatePresence>
            {showCrisisAlert && (
              <CrisisAlert
                helplineInfo={crisisHelpline}
                onDismiss={() => setShowCrisisAlert(false)}
                onGetHelp={() => {
                  // Implement chat support or redirect to help resources
                  window.open('https://suicidepreventionlifeline.org/chat/', '_blank');
                }}
              />
            )}
            {isCreating && (
              <EntryForm
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FormHeader>
                  <FormTitle>
                    {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
                  </FormTitle>
                  <FormActions>
                    <ActionButton onClick={resetForm}>
                      Cancel
                    </ActionButton>
                    <ActionButton
                      className="primary"
                      onClick={handleSave}
                      disabled={saveEntryMutation.isLoading}
                    >
                      {saveEntryMutation.isLoading ? 'Saving...' : 'Save Entry'}
                    </ActionButton>
                  </FormActions>
                </FormHeader>

                <TitleInput
                  type="text"
                  placeholder="What's on your mind today?"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />

                <TagsInput
                  type="text"
                  placeholder="Tags (comma separated): work, family, travel..."
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />

                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Start writing your thoughts..."
                />

                <VoiceRecorder
                  onTranscription={handleVoiceTranscription}
                  disabled={saveEntryMutation.isLoading}
                />
              </EntryForm>
            )}
          </AnimatePresence>

          <EntriesSection>
            <h2>Your Journal Entries</h2>
            <EntriesList>
            <AnimatePresence>
              {entries && entries.length > 0 ? (
                entries.map((entry) => (
                  <EntryCard
                    key={entry.id || entry._id}
                    onClick={() => handleNewEdit(entry)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <EntryTitle>{entry.title}</EntryTitle>
                    <EntryPreview>
                      {stripHtml(entry.content).substring(0, 200)}...
                    </EntryPreview>
                    <EntryMeta>
                      <EntryDate>{formatDate(entry.createdAt)}</EntryDate>
                      <EntryMood>
                        <span>Mood: {entry.mood?.detected || entry.mood?.manual || 'Not detected'}</span>
                      </EntryMood>
                    </EntryMeta>
                    <EntryActions>
                      <ActionIcon 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNewEdit(entry);
                        }}
                        title="Edit Entry"
                      >
                        📝
                      </ActionIcon>
                      <ActionIcon 
                        className="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNewDelete(entry);
                        }}
                        title="Delete Entry"
                      >
                        ❌
                      </ActionIcon>
                    </EntryActions>
                  </EntryCard>
                ))
              ) : (
                <EmptyState>
                  <EmptyIcon>📝</EmptyIcon>
                  <h3>No journal entries yet</h3>
                  <p>Start writing your first entry to track your mood and thoughts.</p>
                </EmptyState>
              )}
            </AnimatePresence>
          </EntriesList>
        </EntriesSection>
      </MainContent>

      <Sidebar>
        <MoodSelector
          selectedMood={formData.mood}
          onMoodChange={(mood) => setFormData(prev => ({ ...prev, mood }))}
          intensity={formData.intensity}
          onIntensityChange={(intensity) => setFormData(prev => ({ ...prev, intensity }))}
          title="Current Mood"
        />
      </Sidebar>

      {/* Self-Harm Alert Modal */}
      <SelfHarmAlert
        isOpen={showSelfHarmAlert}
        onClose={() => setShowSelfHarmAlert(false)}
        onContinue={() => {
          setShowSelfHarmAlert(false);
          // Continue with saving the entry
          const entryData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          };
          saveEntryMutation.mutate(entryData);
          // Invalidate analytics queries to refresh data
          queryClient.invalidateQueries(['analytics']);
          queryClient.invalidateQueries(['mood-insights']);
          queryClient.invalidateQueries(['dashboard-stats']);
          queryClient.invalidateQueries(['user-stats']);
        }}
      />
    </JournalGrid>
    </Container>
  );
};

export default JournalPage;

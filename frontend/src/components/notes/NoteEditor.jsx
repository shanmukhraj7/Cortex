import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import Textarea from '../ui/TextArea.jsx'
import TagBadge from '../ui/TagBadge.jsx'
import useNotesStore from '../../store/notesStore.js'
import { useToast } from '../ui/Toast.jsx'
import { parseTags, tagsToString } from '../../utils/helpers.js'

export default function NoteEditor({ isOpen, onClose, note = null }) {
  const isEditing = Boolean(note)
  const { createNote, updateNote, isSaving } = useNotesStore()
  const toast = useToast()

  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags,     setTags]     = useState([])
  const [errors,   setErrors]   = useState({})

  useEffect(() => {
    if (isOpen) {
      setTitle(note?.title ?? '')
      setContent(note?.content ?? '')
      setTags(note?.tags ?? [])
      setTagInput(note?.tags ? tagsToString(note.tags) : '')
      setErrors({})
    }
  }, [isOpen, note])

  const validate = () => {
    const e = {}
    if (!title.trim())   e.title   = 'Title is required.'
    if (!content.trim()) e.content = 'Content is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleTagChange = (e) => {
    setTagInput(e.target.value)
    setTags(parseTags(e.target.value))
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const payload = { title: title.trim(), content: content.trim(), tags: Array.isArray(tags) ? tags : [] }
    const res = isEditing
      ? await updateNote(note.id, payload)
      : await createNote(payload)

    if (res.success) {
      toast.success(isEditing ? 'Note updated.' : 'Note created.')
      onClose()
    } else {
      toast.error(res.error || 'Something went wrong.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Note' : 'New Note'} size="md">
      <div className="p-md flex flex-col gap-md">
        {/* ML indicator */}
        <div className="flex items-center gap-sm p-sm bg-secondary-container/10 border border-secondary/15 rounded-lg">
          <span className="ai-dot" />
          <span className="font-code text-[11px] text-secondary/80">
            Content will be vectorized by ML service on save
          </span>
        </div>

        <Input
          label="Title"
          placeholder="What is this note about?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Content"
          placeholder="Write your thoughts, ideas, research..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={errors.content}
          rows={10}
        />

        <div className="flex flex-col gap-xs">
          <Input
            label="Tags"
            placeholder="algorithms, python, research"
            value={tagInput}
            onChange={handleTagChange}
            hint="Comma-separated — used for filtering and semantic context"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-xs mt-xs">
              {tags.map(tag => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  size="sm"
                  onRemove={(t) => {
                    const next = tags.filter(x => x !== t)
                    setTags(next)
                    setTagInput(tagsToString(next))
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end items-center gap-sm pt-sm border-t border-white/5 mt-xs">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSaving}
            rightIcon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            {isEditing ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
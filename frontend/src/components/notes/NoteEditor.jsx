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
    const payload = { 
      title: title.trim(), 
      description: content.trim(),   
      tags 
    }
    const res = isEditing ? await updateNote(note.id, payload) : await createNote(payload)
    if (res.success) {
      toast.success(isEditing ? 'Note updated.' : 'Note created.')
      onClose()
    } else {
      toast.error(res.error || 'Something went wrong.')
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length

  return (
      <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Note' : 'New Note'} size="md">
        <div className="p-6 flex flex-col gap-5">
          <Input
              label="Title"
              placeholder="What is this note about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <Textarea
                label="Content"
                placeholder="Write your thoughts, ideas, research…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                error={errors.content}
                rows={12}
            />
            {content && (
                <p className="text-[10px] text-zinc-700 font-mono text-right">
                  {wordCount} words · {charCount} chars
                </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Input
                label="Tags"
                placeholder="python, machine-learning, research"
                value={tagInput}
                onChange={handleTagChange}
                hint="Separate with commas — used for filtering and context"
            />
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {tags.map((tag) => (
                      <TagBadge
                          key={tag}
                          tag={tag}
                          onRemove={(t) => {
                            const next = tags.filter((x) => x !== t)
                            setTags(next)
                            setTagInput(tagsToString(next))
                          }}
                      />
                  ))}
                </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-zinc-800 gap-3">
            <p className="text-[10px] text-zinc-700 font-mono hidden sm:block">
              {isEditing ? `Editing: ${note?.id?.slice(0, 8)}…` : 'New note · will be embedded automatically'}
            </p>
            <div className="flex gap-2 ml-auto">
              <Button variant="secondary" onClick={onClose} disabled={isSaving} size="sm">
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={isSaving} size="sm">
                {isEditing ? 'Save Changes' : 'Create Note'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
  )
}
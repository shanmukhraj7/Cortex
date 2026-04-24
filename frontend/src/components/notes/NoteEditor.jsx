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

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [errors, setErrors] = useState({})

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
    if (!title.trim()) e.title = 'Title is required.'
    if (!content.trim()) e.content = 'Content is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleTagInputChange = (e) => {
    const val = e.target.value
    setTagInput(val)
    setTags(parseTags(val))
  }

  const removeTag = (tag) => {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    setTagInput(tagsToString(next))
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const payload = { title: title.trim(), content: content.trim(), tags }

    const result = isEditing
      ? await updateNote(note.id, payload)
      : await createNote(payload)

    if (result.success) {
      toast.success(isEditing ? 'Note updated!' : 'Note created!')
      onClose()
    } else {
      toast.error(result.error || 'Something went wrong.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Note' : 'New Note'} size="md">
      <div className="p-6 flex flex-col gap-5">
        <Input
          label="Title"
          placeholder="Give your note a title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Content"
          placeholder="Write anything — ideas, notes, summaries…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={errors.content}
          rows={10}
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Tags"
            placeholder="python, machine-learning, notes"
            value={tagInput}
            onChange={handleTagInputChange}
            hint="Separate tags with commas"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagBadge key={tag} tag={tag} onRemove={removeTag} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-surface-200/10">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            {isEditing ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
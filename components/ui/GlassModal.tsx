'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useDevLinksStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/defaultLinks';
import { getFaviconUrl } from '@/lib/utils';
import { LinkCategory } from '@/lib/types';

const schema = z.object({
  url: z.string().url({ message: 'Enter a valid URL (https://...)' }),
  title: z.string().min(1, 'Title is required').max(60),
  description: z.string().max(800, 'Description is too long').optional(),
  category: z.string().min(1),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function GlassModal() {
  const { isModalOpen, editingLink, closeModal, addLink, updateLink } = useDevLinksStore();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'dev-tools' },
  });

  const urlVal = watch('url');

  useEffect(() => {
    if (editingLink) {
      setValue('url', editingLink.url);
      setValue('title', editingLink.title);
      setValue('description', editingLink.description ?? '');
      setValue('category', editingLink.category);
      setValue('tags', editingLink.tags?.join(', ') ?? '');
    } else {
      reset({ category: 'dev-tools' });
    }
  }, [editingLink, setValue, reset]);

  const handleUrlBlur = () => {
    const title = watch('title');
    if (urlVal && !title) {
      try {
        const domain = new URL(urlVal).hostname.replace('www.', '').split('.')[0];
        setValue('title', domain.charAt(0).toUpperCase() + domain.slice(1));
      } catch {}
    }
  };

  const onSubmit = (data: FormData) => {
    const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const payload = {
      url: data.url,
      title: data.title,
      description: data.description,
      category: data.category as LinkCategory,
      tags,
      favicon: getFaviconUrl(data.url),
    };
    if (editingLink) {
      updateLink(editingLink.id, payload);
    } else {
      addLink(payload);
    }
    closeModal();
    reset();
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="modal-backdrop"
          onClick={closeModal}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 460,
              background: 'var(--c-modal-bg)',
              border: '1px solid var(--c-border)',
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 32px 80px var(--c-shadow-card)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 20px 18px',
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text-1)', letterSpacing: '-0.025em', lineHeight: 1 }}>
                  {editingLink ? 'Edit link' : 'Add link'}
                </h2>
                <p style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 4 }}>
                  {editingLink ? 'Update the resource details' : 'Save a new resource to your panel'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="btn btn-ghost"
                style={{ width: 30, height: 30, borderRadius: 8, padding: 0 }}
              >
                <X size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* URL */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-3)', marginBottom: 6 }}>
                  URL
                </label>
                <input
                  {...register('url')}
                  onBlur={handleUrlBlur}
                  className="input"
                  placeholder="https://example.com"
                />
                {errors.url && <p style={{ fontSize: 10, color: 'rgba(220,80,80,0.8)', marginTop: 4 }}>{errors.url.message}</p>}
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-3)', marginBottom: 6 }}>
                  Title
                </label>
                <input {...register('title')} className="input" placeholder="Resource name" />
                {errors.title && <p style={{ fontSize: 10, color: 'rgba(220,80,80,0.8)', marginTop: 4 }}>{errors.title.message}</p>}
              </div>

              {/* Two columns: category + tags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-3)', marginBottom: 6 }}>
                    Category
                  </label>
                  <select {...register('category')} className="input" style={{ height: 40 }}>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id} style={{ background: '#0d0d0d' }}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-3)', marginBottom: 6 }}>
                    Tags
                  </label>
                  <input {...register('tags')} className="input" placeholder="react, ts, css" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-3)', marginBottom: 6 }}>
                  Description <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea {...register('description')} className="input" rows={3} placeholder="What is this resource for?" style={{ maxHeight: 120, resize: 'vertical' }} />
                {errors.description && <p style={{ fontSize: 10, color: 'rgba(220,80,80,0.8)', marginTop: 4 }}>{errors.description.message}</p>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
                <button type="button" onClick={closeModal} className="btn btn-glass" style={{ flex: 1, height: 38, fontSize: 12 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-white" style={{ flex: 2, height: 38, fontSize: 12, fontWeight: 600 }}>
                  {editingLink ? 'Save changes' : 'Add resource'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

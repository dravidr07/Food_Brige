import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, Utensils, Handshake, HeartHandshake, Leaf, Loader2, UtensilsCrossed, Users, AlertCircle, ChevronLeft, Camera, Trash2 } from 'lucide-react';
import { easeOutExpo } from '@/lib/animations';
import { FOOD } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { ConfettiOverlay, useConfetti } from './Confetti';
import { SuccessCheckmark, FloatingFoodIcons } from './SuccessAnimation';
import { BottomSheetHandle, SPRING_TAP, SPRING_SHEET } from '@/lib/springs';

export type FormType = 'donate' | 'partner' | 'volunteer';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  half?: boolean;
}

const FIELDS: Record<FormType, { title: string; subtitle: string; fields: FormField[] }> = {
  donate: {
    title: 'Share Food. Spread Happiness.',
    subtitle: 'Share your surplus — it takes less than a minute.',
    fields: [
      { name: 'donorName', label: 'Your Name', type: 'text', placeholder: 'Jane Doe', required: true, half: true },
      { name: 'contact', label: 'Phone or Email', type: 'text', placeholder: 'jane@email.com', required: true, half: true },
      { name: 'foodType', label: 'Type of Food', type: 'select', options: ['Cooked Meals', 'Fresh Produce', 'Packaged Items', 'Bakery', 'Beverages', 'Other'], required: true, half: true },
      { name: 'quantity', label: 'Quantity (portions)', type: 'number', placeholder: '50', required: true, half: true },
      { name: 'location', label: 'Pickup Location', type: 'text', placeholder: 'Street, City', required: true },
      { name: 'pickupTime', label: 'Available Pickup Time', type: 'text', placeholder: 'e.g. 6-8 PM today', required: true },
      { name: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Allergies, packaging details, etc.' },
    ],
  },
  partner: {
    title: "Let's Create an Impact Together.",
    subtitle: 'Join our network of verified NGOs and distributors.',
    fields: [
      { name: 'orgName', label: 'Organization Name', type: 'text', placeholder: 'Hope Foundation', required: true, half: true },
      { name: 'contactName', label: 'Contact Person', type: 'text', placeholder: 'John Smith', required: true, half: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'org@email.com', required: true, half: true },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 000-0000', required: true, half: true },
      { name: 'orgType', label: 'Organization Type', type: 'select', options: ['NGO', 'Restaurant', 'Shelter', 'Food Bank', 'Community Center', 'Religious Institution', 'Other'], required: true, half: true },
      { name: 'capacity', label: 'Daily Capacity (meals)', type: 'number', placeholder: '200', half: true },
      { name: 'area', label: 'Service Area / Location', type: 'text', placeholder: 'City, Region', required: true },
    ],
  },
  volunteer: {
    title: 'Become a Community Champion.',
    subtitle: 'Join a community of drivers, packers, and coordinators.',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Alex Chen', required: true, half: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'alex@email.com', required: true, half: true },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 000-0000', required: true, half: true },
      { name: 'city', label: 'City / Location', type: 'text', placeholder: 'Impact City', required: true, half: true },
      { name: 'role', label: 'Preferred Activity', type: 'select', options: ['Driver', 'Packer', 'Coordinator', 'Any'], required: true, half: true },
      { name: 'availability', label: 'Availability', type: 'select', options: ['Weekdays', 'Weekends', 'Evenings', 'Flexible'], half: true },
      { name: 'experience', label: 'Relevant Experience', type: 'textarea', placeholder: 'Tell us about yourself...' },
    ],
  },
};

const HEADER_CONFIG: Record<FormType, { icon: typeof Utensils; gradient: string; food: string }> = {
  donate: { icon: Utensils, gradient: 'from-orange to-orange-dark', food: FOOD.fruitBowl },
  partner: { icon: Handshake, gradient: 'from-forest to-forest-dark', food: FOOD.vegMarket },
  volunteer: { icon: HeartHandshake, gradient: 'from-forest-light to-forest', food: FOOD.tomatoes },
};

const SUCCESS_MESSAGES: Record<FormType, string> = {
  donate: 'food donation',
  partner: 'partnership request',
  volunteer: 'volunteer application',
};

export default function FormModal({ type, onClose, onSuccess }: { type: FormType; onClose: () => void; onSuccess?: () => void }) {
  const config = FIELDS[type];
  const headerConfig = HEADER_CONFIG[type];
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reviewStep, setReviewStep] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { particles, fire } = useConfetti();

  // Live impact preview for donation form
  const impactPreview = useMemo(() => {
    if (type !== 'donate') return null;
    const qty = Number(values.quantity) || 0;
    const foodType = values.foodType || '';
    // Approx: cooked meals ~0.4kg per portion, produce ~0.5kg per portion
    const kgPerPortion = foodType === 'Fresh Produce' ? 0.5 : 0.4;
    const totalKg = qty * kgPerPortion;
    const meals = Math.round(totalKg / 0.4);
    const people = Math.round(meals / 1.5);
    return { meals, people, totalKg };
  }, [type, values.quantity, values.foodType]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => { document.body.style.overflow = ''; window.removeEventListener('resize', check); };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const update = (name: string, val: string) => {
    setValues((v) => ({ ...v, [name]: val }));
    setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Photo must be under 5MB.');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setSubmitError('');
  };

  const handlePhotoRemove = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    setPhotoUploading(true);
    const ext = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `donation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('donation-photos')
      .upload(fileName, photoFile, { contentType: photoFile.type });
    setPhotoUploading(false);
    if (uploadError) {
      setSubmitError('Could not upload photo. Please try again.');
      return null;
    }
    const { data: urlData } = supabase.storage.from('donation-photos').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.required && !values[f.name]?.trim()) {
        e[f.name] = 'This field is required.';
      } else if (f.type === 'email' && values[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.name])) {
        e[f.name] = 'Please enter a valid email.';
      } else if (f.type === 'number' && values[f.name] && Number(values[f.name]) <= 0) {
        e[f.name] = 'Enter a valid number.';
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    // For donations, go to review step first; others submit directly
    if (type === 'donate' && !reviewStep) {
      setReviewStep(true);
      return;
    }
    doSubmit();
  };

  const doSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    let photoUrl: string | null = null;
    if (type === 'donate' && photoFile) {
      photoUrl = await uploadPhoto();
      if (photoUrl === null && photoFile) {
        setSubmitting(false);
        return;
      }
    }

    let insertError: { message: string } | null = null;

    if (type === 'donate') {
      const { error } = await supabase.from('donations').insert({
        donor_name: values.donorName || '',
        food_type: values.foodType || 'Cooked Meals',
        quantity: Number(values.quantity) || 0,
        pickup_location: `${values.location || ''} (${values.pickupTime || 'time TBD'})`,
        notes: values.notes || values.contact || '',
        photo_url: photoUrl,
      });
      insertError = error;
    } else if (type === 'partner') {
      const { error } = await supabase.from('partners').insert({
        org_name: values.orgName || '',
        contact_name: values.contactName || '',
        email: values.email || null,
        phone: values.phone || null,
        org_type: values.orgType || 'NGO',
        service_area: values.area || '',
        daily_capacity: Number(values.capacity) || 0,
      });
      insertError = error;
    } else if (type === 'volunteer') {
      const { error } = await supabase.from('volunteers').insert({
        name: values.name || '',
        city: values.city || '',
        region: values.role || '',
      });
      insertError = error;
    }

    setSubmitting(false);

    if (insertError) {
      setSubmitError(insertError.message || 'Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
    fire(45);
    onSuccess?.();
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const Icon = headerConfig.icon;

  // Mobile: bottom-sheet; Desktop: centered modal
  const entrance = isMobile
    ? { initial: { opacity: 0, y: '100%' }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: '100%' } }
    : { initial: { opacity: 0, scale: 0.9, rotateX: -6, y: 40 }, animate: { opacity: 1, scale: 1, rotateX: 0, y: 0 }, exit: { opacity: 0, scale: 0.92, y: 40 } };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
        className={`fixed inset-0 z-[80] flex p-4 ${isMobile ? 'items-end' : 'items-center justify-center'}`}
      >
        <div className="absolute inset-0 bg-dark/50 backdrop-blur-md" />

        <motion.div
          ref={modalRef}
          {...entrance}
          transition={isMobile
            ? { ...SPRING_SHEET }
            : { type: 'spring', stiffness: 260, damping: 24 }}
          style={!isMobile ? { transformPerspective: 1000 } : {}}
          className={`relative z-10 w-full overflow-hidden bg-cream shadow-float ${
            isMobile ? 'max-h-[92vh] rounded-t-4xl' : 'max-h-[90vh] max-w-lg overflow-y-auto rounded-4xl'
          }`}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative flex flex-col items-center px-6 py-14 text-center"
            >
              <ConfettiOverlay particles={particles} />
              <FloatingFoodIcons />
              <SuccessCheckmark size={84} />
              <motion.h3
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-2xl font-extrabold text-dark"
              >
                Thank You!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-3 max-w-sm text-dark/60"
              >
                Your {SUCCESS_MESSAGES[type]} has been received and saved. We'll be in touch soon!
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.93 }}
                transition={{ delay: 0.5, ...SPRING_TAP }}
                onClick={onClose}
                className="mt-8 flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 font-bold text-cream shadow-lg shadow-forest/25"
              >
                Close <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          ) : (
            <>
              {isMobile && <BottomSheetHandle />}
              {/* Premium gradient header with floating food */}
              <div className={`relative overflow-hidden bg-gradient-to-r ${headerConfig.gradient} px-6 pb-6 pt-7`}>
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{ background: 'linear-gradient(120deg, #FF9254, #B8E3C5)', backgroundSize: '200% 200%' }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />

                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Close form"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Floating food icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="relative flex items-center gap-3"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-xl font-extrabold text-white"
                    >
                      {config.title}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="text-sm text-white/70"
                    >
                      {config.subtitle}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Floating food image accent */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -right-4 -top-4 h-20 w-20 overflow-hidden rounded-2xl opacity-30"
                >
                  <img src={headerConfig.food} alt="" className="h-full w-full object-cover" />
                </motion.div>

                {/* Decorative leaf */}
                <motion.div
                  className="absolute right-10 bottom-2 text-white/15"
                  animate={{ rotate: [0, 15, 0], y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Leaf className="h-8 w-8" />
                </motion.div>
              </div>

              {/* Form body */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {/* Review step for donations */}
                {reviewStep && type === 'donate' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-5"
                  >
                    <button
                      type="button"
                      onClick={() => setReviewStep(false)}
                      className="mb-3 flex items-center gap-1 text-sm font-bold text-dark/50 transition hover:text-forest"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back to edit
                    </button>
                    <div className="overflow-hidden rounded-3xl border border-dark/10 bg-white">
                      <div className="bg-gradient-to-r from-fresh/20 to-cream px-5 py-3">
                        <p className="text-sm font-extrabold text-dark">Donation Summary</p>
                      </div>
                      <div className="divide-y divide-dark/5">
                        {[
                          { label: 'Donor', value: values.donorName },
                          { label: 'Food Type', value: values.foodType },
                          { label: 'Quantity', value: `${values.quantity} portions` },
                          { label: 'Pickup Location', value: values.location },
                          { label: 'Available Time', value: values.pickupTime },
                          { label: 'Contact', value: values.contact },
                          ...(values.notes ? [{ label: 'Notes', value: values.notes }] : []),
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm font-semibold text-dark/50">{row.label}</span>
                            <span className="max-w-[60%] truncate text-sm font-bold text-dark">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {impactPreview && impactPreview.meals > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mt-4 grid grid-cols-3 gap-3"
                      >
                        <div className="rounded-2xl bg-orange/10 p-3 text-center">
                          <UtensilsCrossed className="mx-auto mb-1 h-5 w-5 text-orange-dark" />
                          <div className="text-lg font-extrabold text-dark">{impactPreview.meals}</div>
                          <div className="text-[10px] font-semibold text-dark/50">Meals</div>
                        </div>
                        <div className="rounded-2xl bg-forest/10 p-3 text-center">
                          <Users className="mx-auto mb-1 h-5 w-5 text-forest" />
                          <div className="text-lg font-extrabold text-dark">{impactPreview.people}</div>
                          <div className="text-[10px] font-semibold text-dark/50">People Fed</div>
                        </div>
                        <div className="rounded-2xl bg-fresh/20 p-3 text-center">
                          <Leaf className="mx-auto mb-1 h-5 w-5 text-forest" />
                          <div className="text-lg font-extrabold text-dark">{impactPreview.totalKg.toFixed(1)}</div>
                          <div className="text-[10px] font-semibold text-dark/50">kg Saved</div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {config.fields.map((field, i) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.4 }}
                        className={field.half ? '' : 'sm:col-span-2'}
                      >
                        <label className="block text-sm font-semibold text-dark/80">
                          {field.label}
                          {field.required && <span className="text-orange"> *</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={values[field.name] || ''}
                            onChange={(e) => update(field.name, e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-dark/15 bg-white px-4 py-3 text-sm text-dark transition focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15"
                          >
                            <option value="">Select...</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            value={values[field.name] || ''}
                            onChange={(e) => update(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="mt-1.5 w-full rounded-xl border border-dark/15 bg-white px-4 py-3 text-sm text-dark transition focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15"
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={values[field.name] || ''}
                            onChange={(e) => update(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="mt-1.5 w-full rounded-xl border border-dark/15 bg-white px-4 py-3 text-sm text-dark transition focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15"
                          />
                        )}
                        <AnimatePresence>
                          {errors[field.name] && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-1 text-xs text-orange-dark"
                            >
                              {errors[field.name]}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  {/* Photo upload — donate type only, not in review step */}
                  {type === 'donate' && !reviewStep && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <label className="block text-sm font-semibold text-dark/80">
                        Food Photo <span className="text-dark/30 font-normal">(optional)</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      {photoPreview ? (
                        <div className="relative mt-2 overflow-hidden rounded-2xl border border-dark/15">
                          <img src={photoPreview} alt="Food donation" className="h-44 w-full object-cover" />
                          <button
                            type="button"
                            onClick={handlePhotoRemove}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-dark/60 text-white backdrop-blur transition hover:bg-dark/80"
                            aria-label="Remove photo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 rounded-lg bg-dark/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                            {photoFile?.name}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-dark/15 bg-white/50 py-6 transition hover:border-forest hover:bg-fresh/10"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10">
                            <Camera className="h-5 w-5 text-forest" />
                          </div>
                          <span className="text-sm font-semibold text-dark/60">Tap to add a photo of your food</span>
                          <span className="text-xs text-dark/30">JPG, PNG up to 5MB</span>
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Photo preview in review step */}
                  {type === 'donate' && reviewStep && photoPreview && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="overflow-hidden rounded-2xl border border-dark/10"
                    >
                      <img src={photoPreview} alt="Food donation" className="h-32 w-full object-cover" />
                    </motion.div>
                  )}

                  {/* Submit error */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 rounded-xl bg-orange/10 px-4 py-3 text-sm font-semibold text-orange-dark"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ ...SPRING_TAP }}
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange to-orange-dark py-4 font-bold text-white shadow-lg shadow-orange/30 disabled:opacity-60"
                  >
                    {submitting || photoUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> {photoUploading ? 'Uploading photo...' : 'Saving...'}
                      </>
                    ) : reviewStep && type === 'donate' ? (
                      <>
                        Confirm Donation <CheckCircle2 className="h-5 w-5" />
                      </>
                    ) : type === 'donate' ? (
                      <>
                        Review Donation <ArrowRight className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        Submit <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                  <p className="text-center text-xs text-dark/40">
                    {type === 'donate' ? 'Your donation is saved to our database. We\'ll match you with a nearby NGO.' : 'Your submission is saved to our database.'}
                  </p>
                </form>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

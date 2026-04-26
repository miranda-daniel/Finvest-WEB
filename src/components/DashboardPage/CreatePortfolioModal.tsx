import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCreatePortfolio } from '@/api/hooks/portfolios/useCreatePortfolio';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer'),
  description: z.string().max(200, 'Description must be 200 characters or fewer').optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreatePortfolioModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePortfolioModal = ({ open, onClose }: CreatePortfolioModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { submit, loading, error } = useCreatePortfolio(() => {
    reset();
    setIsFavorite(false);
    onClose();
  });

  const onSubmit = (values: FormValues) => {
    submit(values.name, values.description || undefined, isFavorite);
  };

  const handleClose = () => {
    reset();
    setIsFavorite(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="modal-content">
        <DialogHeader>
          <DialogTitle className="modal-title">New Portfolio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="portfolio-name">Name</Label>
            <Input
              id="portfolio-name"
              {...register('name')}
              placeholder="e.g. Long Term, Trading…"
              autoFocus
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="portfolio-description">Description <span className="normal-case font-normal">(optional)</span></Label>
            <Input
              id="portfolio-description"
              {...register('description')}
              placeholder="e.g. Long-term buy and hold strategy"
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-xs text-rose-400">{errors.description.message}</p>}
          </div>

          <div className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/3 px-3.5 py-3">
            <div className="flex items-center gap-3">
              <StarIcon
                className={`size-4 ${isFavorite ? 'text-amber-400' : 'text-slate-500'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
              <div>
                <p className="text-body font-medium">Mark as favorite</p>
                <p className="text-label">Open this portfolio by default on login</p>
              </div>
            </div>
            <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
          </div>

          {error && (
            <p className="text-xs text-rose-400">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Creating…' : 'Create Portfolio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

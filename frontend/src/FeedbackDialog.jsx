import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function FeedbackDialog({ open, onOpenChange, messageId }) {
  const [feedback, setFeedback] = useState('');
  const [selectedReasons, setSelectedReasons] = useState([]);

  const reasons = [
    'Inaccurate',
    'Incomplete',
    'Unclear',
    'Irrelevant',
    'Other'
  ];

  const handleReasonToggle = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    if (selectedReasons.length === 0 && !feedback.trim()) {
      toast.error('Please select a reason or provide feedback');
      return;
    }

    toast.success('Thank you for your feedback!');
    setFeedback('');
    setSelectedReasons([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by telling us what went wrong with this response.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">What was the issue?</label>
            <div className="grid grid-cols-2 gap-2">
              {reasons.map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReasonToggle(reason)}
                  className={`p-2 rounded-md border-2 transition-colors ${
                    selectedReasons.includes(reason)
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Additional feedback (optional)</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about the issue..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
          >
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { cn } from '@/lib/utils';

const Switch = ({
  className,
  ...props
}: SwitchPrimitive.Root.Props) => {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none data-checked:bg-blue-500 data-unchecked:bg-white/10 data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-white shadow transition-transform data-checked:translate-x-4 data-unchecked:translate-x-0.5"
      />
    </SwitchPrimitive.Root>
  );
};

export { Switch };

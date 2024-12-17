import { composeEventHandlers } from '@radix-ui/primitive';
import { useComposedRefs } from '@radix-ui/react-compose-refs';
import { createContextScope } from '@radix-ui/react-context';
import { DismissableLayer } from '@radix-ui/react-dismissable-layer';
import { useFocusGuards } from '@radix-ui/react-focus-guards';
import { FocusScope } from '@radix-ui/react-focus-scope';
import { useId } from '@radix-ui/react-id';
import * as PopperPrimitive from '@radix-ui/react-popper';
import { createPopperScope } from '@radix-ui/react-popper';
import { Portal as PortalPrimitive } from '@radix-ui/react-portal';
import { Presence } from '@radix-ui/react-presence';
import { Primitive } from '@radix-ui/react-primitive';
import { Slot } from '@radix-ui/react-slot';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { hideOthers } from 'aria-hidden';
import * as React from 'react';
import { RemoveScroll } from 'react-remove-scroll';

import type { Scope } from '@radix-ui/react-context';

/* -------------------------------------------------------------------------------------------------
 * Popover
 * -----------------------------------------------------------------------------------------------*/

const POPOVER_NAME = 'Popover';

type ScopedProps<P> = P & { __scopePopover?: Scope };
const [createPopoverContext, createPopoverScope] = createContextScope(POPOVER_NAME, [
  createPopperScope,
]);
const usePopperScope = createPopperScope();

type PopoverContextValue = {
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentId: string;
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  hasCustomAnchor: boolean;
  onCustomAnchorAdd(): void;
  onCustomAnchorRemove(): void;
  modal: boolean;
};

const [PopoverProvider, usePopoverContext] =
  createPopoverContext<PopoverContextValue>(POPOVER_NAME);

interface PopoverProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

const Popover: React.FC<PopoverProps> = (props: ScopedProps<PopoverProps>) => {
  const {
    __scopePopover,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = false,
  } = props;
  const popperScope = usePopperScope(__scopePopover);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [hasCustomAnchor, setHasCustomAnchor] = React.useState(false);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <PopperPrimitive.Root {...popperScope}>
      <PopoverProvider
        scope={__scopePopover}
        contentId={useId()}
        triggerRef={triggerRef}
        open={open}
        onOpenChange={setOpen}
        onOpenToggle={React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen])}
        hasCustomAnchor={hasCustomAnchor}
        onCustomAnchorAdd={React.useCallback(() => setHasCustomAnchor(true), [])}
        onCustomAnchorRemove={React.useCallback(() => setHasCustomAnchor(false), [])}
        modal={modal}
      >
        {children}
      </PopoverProvider>
    </PopperPrimitive.Root>
  );
};

Popover.displayName = POPOVER_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverAnchor
 * -----------------------------------------------------------------------------------------------*/

const ANCHOR_NAME = 'PopoverAnchor';

type PopoverAnchorElement = React.ElementRef<typeof PopperPrimitive.Anchor>;
type PopperAnchorProps = React.ComponentPropsWithoutRef<typeof PopperPrimitive.Anchor>;
interface PopoverAnchorProps extends PopperAnchorProps {}

const PopoverAnchor = React.forwardRef<PopoverAnchorElement, PopoverAnchorProps>(
  (props: ScopedProps<PopoverAnchorProps>, forwardedRef) => {
    const { __scopePopover, ...anchorProps } = props;
    const context = usePopoverContext(ANCHOR_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    const { onCustomAnchorAdd, onCustomAnchorRemove } = context;

    React.useEffect(() => {
      onCustomAnchorAdd();
      return () => onCustomAnchorRemove();
    }, [onCustomAnchorAdd, onCustomAnchorRemove]);

    return <PopperPrimitive.Anchor {...popperScope} {...anchorProps} ref={forwardedRef} />;
  }
);

PopoverAnchor.displayName = ANCHOR_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'PopoverTrigger';

type PopoverTriggerElement = React.ElementRef<typeof Primitive.button>;
type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>;
interface PopoverTriggerProps extends PrimitiveButtonProps {}

const PopoverTrigger = React.forwardRef<PopoverTriggerElement, PopoverTriggerProps>(
  (props: ScopedProps<PopoverTriggerProps>, forwardedRef) => {
    const { __scopePopover, ...triggerProps } = props;
    const context = usePopoverContext(TRIGGER_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);

    const trigger = (
      <Primitive.button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        data-state={getState(context.open)}
        {...triggerProps}
        ref={composedTriggerRef}
        onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
      />
    );

    return context.hasCustomAnchor ? (
      trigger
    ) : (
      <PopperPrimitive.Anchor asChild {...popperScope}>
        {trigger}
      </PopperPrimitive.Anchor>
    );
  }
);

PopoverTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverPortal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'PopoverPortal';

type PortalContextValue = { forceMount?: true };
const [PortalProvider, usePortalContext] = createPopoverContext<PortalContextValue>(PORTAL_NAME, {
  forceMount: undefined,
});

type PortalProps = React.ComponentPropsWithoutRef<typeof PortalPrimitive>;
interface PopoverPortalProps {
  children?: React.ReactNode;
  /**
   * Specify a container element to portal the content into.
   */
  container?: PortalProps['container'];
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: boolean;
}

const PopoverPortal: React.FC<PopoverPortalProps> = (props: ScopedProps<PopoverPortalProps>) => {
  const { __scopePopover, forceMount, children, container } = props;
  const context = usePopoverContext(PORTAL_NAME, __scopePopover);
  return (
    <PortalProvider scope={__scopePopover} forceMount={forceMount ? true : undefined}>
      <Presence present={forceMount || context.open}>
        <PortalPrimitive asChild container={container}>
          {children}
        </PortalPrimitive>
      </Presence>
    </PortalProvider>
  );
};

PopoverPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'PopoverContent';

interface PopoverContentProps extends PopoverContentTypeProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const PopoverContent = React.forwardRef<PopoverContentTypeElement, PopoverContentProps>(
  (props: ScopedProps<PopoverContentProps>, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopePopover);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    return (
      <Presence present={forceMount || context.open}>
        {context.modal ? (
          <PopoverContentModal {...contentProps} ref={forwardedRef} />
        ) : (
          <PopoverContentNonModal {...contentProps} ref={forwardedRef} />
        )}
      </Presence>
    );
  }
);

PopoverContent.displayName = CONTENT_NAME;

/* -----------------------------------------------------------------------------------------------*/

type PopoverContentTypeElement = PopoverContentImplElement;
interface PopoverContentTypeProps
  extends Omit<PopoverContentImplProps, 'trapFocus' | 'disableOutsidePointerEvents'> {}

const PopoverContentModal = React.forwardRef<PopoverContentTypeElement, PopoverContentTypeProps>(
  (props: ScopedProps<PopoverContentTypeProps>, forwardedRef) => {
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const isRightClickOutsideRef = React.useRef(false);

    // aria-hide everything except the content (better supported equivalent to setting aria-modal)
    React.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);

    return (
      <RemoveScroll as={Slot} allowPinchZoom>
        <PopoverContentImpl
          {...props}
          ref={composedRefs}
          // we make sure we're not trapping once it's been closed
          // (closed !== unmounted when animating out)
          trapFocus={context.open}
          disableOutsidePointerEvents
          onCloseAutoFocus={composeEventHandlers(props.onCloseAutoFocus, (event) => {
            event.preventDefault();
            if (!isRightClickOutsideRef.current) context.triggerRef.current?.focus();
          })}
          onPointerDownOutside={composeEventHandlers(
            props.onPointerDownOutside,
            (event) => {
              const originalEvent = event.detail.originalEvent;
              const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
              const isRightClick = originalEvent.button === 2 || ctrlLeftClick;

              isRightClickOutsideRef.current = isRightClick;
            },
            { checkForDefaultPrevented: false }
          )}
          // When focus is trapped, a `focusout` event may still happen.
          // We make sure we don't trigger our `onDismiss` in such case.
          onFocusOutside={composeEventHandlers(
            props.onFocusOutside,
            (event) => event.preventDefault(),
            { checkForDefaultPrevented: false }
          )}
        />
      </RemoveScroll>
    );
  }
);

const PopoverContentNonModal = React.forwardRef<PopoverContentTypeElement, PopoverContentTypeProps>(
  (props: ScopedProps<PopoverContentTypeProps>, forwardedRef) => {
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    const hasInteractedOutsideRef = React.useRef(false);
    const hasPointerDownOutsideRef = React.useRef(false);

    return (
      <PopoverContentImpl
        {...props}
        ref={forwardedRef}
        trapFocus={false}
        disableOutsidePointerEvents={false}
        onCloseAutoFocus={(event) => {
          props.onCloseAutoFocus?.(event);

          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            // Always prevent auto focus because we either focus manually or want user agent focus
            event.preventDefault();
          }

          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        }}
        onInteractOutside={(event) => {
          props.onInteractOutside?.(event);

          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === 'pointerdown') {
              hasPointerDownOutsideRef.current = true;
            }
          }

          // Prevent dismissing when clicking the trigger.
          // As the trigger is already setup to close, without doing so would
          // cause it to close and immediately open.
          const target = event.target as HTMLElement;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();

          // On Safari if the trigger is inside a container with tabIndex={0}, when clicked
          // we will get the pointer down outside event on the trigger, but then a subsequent
          // focus outside event on the container, we ignore any focus outside event when we've
          // already had a pointer down outside event.
          if (event.detail.originalEvent.type === 'focusin' && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }}
      />
    );
  }
);

/* -----------------------------------------------------------------------------------------------*/

type PopoverContentImplElement = React.ElementRef<typeof PopperPrimitive.Content>;
type FocusScopeProps = React.ComponentPropsWithoutRef<typeof FocusScope>;
type DismissableLayerProps = React.ComponentPropsWithoutRef<typeof DismissableLayer>;
type PopperContentProps = React.ComponentPropsWithoutRef<typeof PopperPrimitive.Content>;
interface PopoverContentImplProps
  extends Omit<PopperContentProps, 'onPlaced'>,
    Omit<DismissableLayerProps, 'onDismiss'> {
  /**
   * Whether focus should be trapped within the `Popover`
   * (default: false)
   */
  trapFocus?: FocusScopeProps['trapped'];

  /**
   * Event handler called when auto-focusing on open.
   * Can be prevented.
   */
  onOpenAutoFocus?: FocusScopeProps['onMountAutoFocus'];

  /**
   * Event handler called when auto-focusing on close.
   * Can be prevented.
   */
  onCloseAutoFocus?: FocusScopeProps['onUnmountAutoFocus'];
}

const PopoverContentImpl = React.forwardRef<PopoverContentImplElement, PopoverContentImplProps>(
  (props: ScopedProps<PopoverContentImplProps>, forwardedRef) => {
    const {
      __scopePopover,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      ...contentProps
    } = props;
    const context = usePopoverContext(CONTENT_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);

    // Make sure the whole tree has focus guards as our `Popover` may be
    // the last element in the DOM (because of the `Portal`)
    useFocusGuards();

    return (
      <FocusScope
        asChild
        loop
        trapped={trapFocus}
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={onCloseAutoFocus}
      >
        <DismissableLayer
          asChild
          disableOutsidePointerEvents={disableOutsidePointerEvents}
          onInteractOutside={onInteractOutside}
          onEscapeKeyDown={onEscapeKeyDown}
          onPointerDownOutside={onPointerDownOutside}
          onFocusOutside={onFocusOutside}
          onDismiss={() => context.onOpenChange(false)}
        >
          <PopperPrimitive.Content
            data-state={getState(context.open)}
            role="dialog"
            id={context.contentId}
            {...popperScope}
            {...contentProps}
            ref={forwardedRef}
            style={{
              ...contentProps.style,
              // re-namespace exposed content custom properties
              ...{
                '--radix-popover-content-transform-origin': 'var(--radix-popper-transform-origin)',
                '--radix-popover-content-available-width': 'var(--radix-popper-available-width)',
                '--radix-popover-content-available-height': 'var(--radix-popper-available-height)',
                '--radix-popover-trigger-width': 'var(--radix-popper-anchor-width)',
                '--radix-popover-trigger-height': 'var(--radix-popper-anchor-height)',
              },
            }}
          />
        </DismissableLayer>
      </FocusScope>
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * PopoverClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = 'PopoverClose';

type PopoverCloseElement = React.ElementRef<typeof Primitive.button>;
interface PopoverCloseProps extends PrimitiveButtonProps {}

const PopoverClose = React.forwardRef<PopoverCloseElement, PopoverCloseProps>(
  (props: ScopedProps<PopoverCloseProps>, forwardedRef) => {
    const { __scopePopover, ...closeProps } = props;
    const context = usePopoverContext(CLOSE_NAME, __scopePopover);
    return (
      <Primitive.button
        type="button"
        {...closeProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, () => context.onOpenChange(false))}
      />
    );
  }
);

PopoverClose.displayName = CLOSE_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopoverArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'PopoverArrow';

type PopoverArrowElement = React.ElementRef<typeof PopperPrimitive.Arrow>;
type PopperArrowProps = React.ComponentPropsWithoutRef<typeof PopperPrimitive.Arrow>;
interface PopoverArrowProps extends PopperArrowProps {}

const PopoverArrow = React.forwardRef<PopoverArrowElement, PopoverArrowProps>(
  (props: ScopedProps<PopoverArrowProps>, forwardedRef) => {
    const { __scopePopover, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopePopover);
    return <PopperPrimitive.Arrow {...popperScope} {...arrowProps} ref={forwardedRef} />;
  }
);

PopoverArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * SubTrigger
 * -----------------------------------------------------------------------------------------------*/

// Constant for the name of the sub-trigger popover
const SUB_TRIGGER_NAME = 'PopoverSubTrigger';

// Types for the element and properties of the sub-trigger popover
type SubTriggerElement = React.ElementRef<typeof Primitive.button>;
type SubTriggerProps = React.ComponentPropsWithoutRef<typeof Primitive.button>;

// Defining the PopoverSubTrigger component with the ref forwarding mechanism
const PopoverSubTrigger = React.forwardRef<SubTriggerElement, ScopedProps<SubTriggerProps>>(
  (props, forwardedRef) => {
    const { __scopePopover, ...triggerProps } = props; // Extract the __scopePopover from props
    const context = usePopoverContext(SUB_TRIGGER_NAME, __scopePopover); // Use the popover context to get context info
    const [subOpen, setSubOpen] = React.useState(false); // Local state to track whether the sub-popover is open or closed

    // Function to toggle the sub-popover open/close state
    const handleToggle = () => {
      setSubOpen((prevOpen) => !prevOpen); // Inverts the current open state
    };

    return (
      <>
        {/* Main trigger button for the popover */}
        <Primitive.button
          type="button"
          aria-haspopup="menu" // Indicates that a menu is available
          aria-expanded={subOpen} // Declares if the sub-popover is open
          aria-controls={context.contentId} // The ID of the content controlled by this button
          data-state={getState(subOpen)} // Assigns the current open/closed state for styling
          {...triggerProps} // Passes the other props down to the button
          ref={forwardedRef} // Forwards the ref to the button element
          onClick={composeEventHandlers(triggerProps.onClick, handleToggle)} // Combines the click handlers (clicking the button)
        />

        {/* Renders the sub-popover content when 'subOpen' is true */}
        {subOpen && (
          <PopoverSubContent __scopePopover={__scopePopover}>
            <p>This is the content of Sub Popover 1</p> {/* Content of the sub-popover */}
          </PopoverSubContent>
        )}
      </>
    );
  }
);

PopoverSubTrigger.displayName = SUB_TRIGGER_NAME; // Sets the display name for the component for debugging purposes

/* -------------------------------------------------------------------------------------------------
 * SubContent
 * -----------------------------------------------------------------------------------------------*/

// Constant for the name of the sub-popover content
const SUB_CONTENT_NAME = 'PopoverSubContent';

// Types for the element and properties of the sub-popover content
type SubContentElement = React.ElementRef<typeof PopoverContent>;
interface SubContentProps extends PopoverContentProps {}

// Defining the PopoverSubContent component with the ref forwarding mechanism
const PopoverSubContent = React.forwardRef<SubContentElement, ScopedProps<SubContentProps>>(
  (props, forwardedRef) => {
    const { __scopePopover, ...contentProps } = props; // Extract the __scopePopover from props

    return (
      <PopoverContent
        {...contentProps} // Passes down the properties to the PopoverContent component
        ref={forwardedRef} // Forwards the ref to the PopoverContent component
        forceMount={true} // Forces the sub-popover content to mount even if hidden
        onClick={(e) => e.stopPropagation()} // Prevents closing the parent Popover when clicking inside the content
      />
    );
  }
);

PopoverSubContent.displayName = SUB_CONTENT_NAME; // Sets the display name for the component for debugging purposes

/* -----------------------------------------------------------------------------------------------*/

// Exports the components for use in other files
export { PopoverSubContent, PopoverSubTrigger };

/* -----------------------------------------------------------------------------------------------*/

function getState(open: boolean) {
  return open ? 'open' : 'closed';
}

const Root = Popover;
const Anchor = PopoverAnchor;
const Trigger = PopoverTrigger;
const Portal = PopoverPortal;
const Content = PopoverContent;
const Close = PopoverClose;
const Arrow = PopoverArrow;
const SubTrigger = PopoverSubTrigger;
const SubContent = PopoverSubContent;

export {
  Anchor,
  Arrow,
  Close,
  Content,
  createPopoverScope,
  //
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Portal,
  //
  Root,
  SubContent,
  SubTrigger,
  Trigger,
};
export type {
  PopoverAnchorProps,
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverPortalProps,
  PopoverProps,
  PopoverTriggerProps,
};

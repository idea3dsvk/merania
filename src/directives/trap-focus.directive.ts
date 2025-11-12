import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appTrapFocus]',
  standalone: true,
})
export class TrapFocusDirective {
  @Input() appTrapFocus = true;

  private focusableElements?: NodeListOf<HTMLElement>;

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.appTrapFocus || event.key !== 'Tab') return;

    this.focusableElements = this.el.nativeElement.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!this.focusableElements || this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

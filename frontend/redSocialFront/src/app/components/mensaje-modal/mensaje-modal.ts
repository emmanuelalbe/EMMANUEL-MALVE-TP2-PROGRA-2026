import { Component, input, output } from '@angular/core';

export type ModalTipo = 'error' | 'exito';

@Component({
  selector: 'app-mensaje-modal',
  templateUrl: './mensaje-modal.html',
  styleUrl: './mensaje-modal.css',
})
export class MensajeModalComponent {
  readonly visible = input(false);
  readonly tipo = input<ModalTipo>('error');
  readonly mensaje = input('');
  readonly titulo = input<string | undefined>(undefined);
  readonly cerrar = output<void>();

  protected tituloModal(): string {
    const tituloPersonalizado = this.titulo();
    if (tituloPersonalizado) {
      return tituloPersonalizado;
    }

    return this.tipo() === 'exito' ? 'Operacion exitosa' : 'Error';
  }

  protected headerClass(): string {
    return this.tipo() === 'exito' ? 'bg-success text-white' : 'bg-danger text-white';
  }

  protected onCerrar(): void {
    this.cerrar.emit();
  }
}

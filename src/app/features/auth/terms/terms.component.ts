import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '@shared/ui/icon.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Termos e Condições</h1>
            <p class="text-gray-600 mt-2">Última atualização: Dezembro 2025</p>
          </div>
          <button (click)="goBack()" class="btn btn-ghost btn-circle" title="Voltar">
            <app-icon [name]="'x'" [size]="24"></app-icon>
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o MultClinic, você aceita estar vinculado por estes termos e
              condições. Se você não concorda com qualquer parte destes termos, você não poderá usar
              o serviço.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">2. Uso Licenciado</h2>
            <p>
              É concedida a você uma licença limitada, não exclusiva e não transferível para usar
              este aplicativo para fins comerciais legítimos relacionados à administração de
              clínica.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">3. Restrições de Uso</h2>
            <p>Você concorda em não:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
              <li>Usar o serviço para qualquer propósito ilegal ou não autorizado</li>
              <li>
                Transmitir, distribuir ou armazenar conteúdo que viole direitos de propriedade
                intelectual
              </li>
              <li>Acessar ou buscar conteúdo através de qualquer tecnologia não autorizada</li>
              <li>Usar o serviço de forma que prejudique a funcionalidade ou segurança</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">4. Conteúdo do Usuário</h2>
            <p>
              Você é responsável por todo o conteúdo que enviar, publicar ou exibir no MultClinic.
              Você retém todos os direitos sobre este conteúdo e concede ao MultClinic uma licença
              para usar este conteúdo apenas conforme necessário para fornecer o serviço.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">5. Política de Privacidade</h2>
            <p>
              O uso do MultClinic também é regido pela nossa Política de Privacidade. Por favor,
              revise nossa Política de Privacidade para entender nossas práticas.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">6. Isenção de Garantias</h2>
            <p>
              O MultiClinic é fornecido no estado em que se encontra. Nós não fazemos garantias de
              qualquer tipo, expressas ou implícitas. Na máxima medida permitida pela lei, o
              MultiClinic renuncia a todas as garantias.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
            <p>
              Em nenhum caso o MultiClinic ou seus fornecedores serão responsáveis por danos
              indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes de ou
              relacionados a estes termos.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">8. Modificações dos Termos</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. As modificações
              entrarão em vigor imediatamente após a publicação. O uso continuado do serviço após as
              modificações constitui aceitação dos termos revisados.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">9. Encerramento</h2>
            <p>
              Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso
              prévio ou responsabilidade, se você violar qualquer disposição destes termos.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">10. Lei Aplicável</h2>
            <p>
              Estes termos e condições são regidos pelas leis da República Federativa do Brasil e
              você irrevogavelmente concorda em se submeter à jurisdição exclusiva dos tribunais
              neste local.
            </p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-gray-900 mb-4">11. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes termos, entre em contato conosco através dos canais
              de suporte disponibilizados no aplicativo.
            </p>
          </section>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex gap-4 pt-6 border-t border-gray-200">
          <button (click)="goBack()" class="btn btn-outline flex-1">
            <app-icon [name]="'arrow-left'" [size]="20"></app-icon>
            Voltar
          </button>
          <button (click)="acceptAndGoBack()" class="btn btn-primary flex-1">
            <app-icon [name]="'tick'" [size]="20"></app-icon>
            Entendi e Aceito
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsComponent {
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }

  acceptAndGoBack(): void {
    this.router.navigate(['/auth/login']);
  }
}

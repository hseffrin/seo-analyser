import { test, expect } from '@playwright/test';

test.describe('SEO Analyser Interface', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Deve adicionar prefixo https:// automaticamente ao digitar o domínio', async ({ page }) => {
        const input = page.locator('input#url');
        await input.fill('google.com');
        await expect(input).toHaveValue('https://google.com');
    });

    test('Deve mostrar erro ao tentar analisar campo vazio', async ({ page }) => {
        await page.click('button[type="submit"]');
        const errorMessage = page.locator('p[class*="error"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toHaveText('Informe uma URL para analisar.');
    });

    test('Deve mostrar estado de carregamento ao analisar uma URL', async ({ page }) => {
        // Intercepta a chamada da API para atrasar a resposta
        await page.route('**/api/analyze', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    url: 'https://example.com',
                    normalizedUrl: 'https://example.com/',
                    htmlLength: 1000,
                    meta: { title: 'Example Title', description: 'Example Description' },
                    openGraph: {},
                    twitter: {},
                    issues: []
                }),
            });
        });

        await page.fill('input#url', 'https://example.com');
        await page.click('button[type="submit"]');

        const button = page.locator('button[type="submit"]');
        await expect(button).toBeDisabled();
        await expect(button).toHaveText('Analisando...');
    });

    test('Deve exibir resultados corretamente após análise bem-sucedida', async ({ page }) => {
        const mockData = {
            url: 'https://example.com',
            normalizedUrl: 'https://example.com/',
            htmlLength: 5000,
            meta: {
                title: 'Título de Exemplo para SEO',
                description: 'Esta é uma descrição de exemplo que deve ter um tamanho razoável para os testes de interface.'
            },
            openGraph: {
                title: 'OG Title',
                description: 'OG Description',
                image: 'https://example.com/image.png'
            },
            twitter: {
                card: 'summary_large_image'
            },
            issues: [
                { id: 'title_ok', level: 'success', message: 'O título tem um bom tamanho (27 caracteres).', field: 'title' },
                { id: 'og_incomplete', level: 'warning', message: 'Tags Open Graph importantes estão incompletas.', field: 'open_graph' }
            ]
        };

        await page.route('**/api/analyze', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockData),
            });
        });

        await page.fill('input#url', 'https://example.com');
        await page.click('button[type="submit"]');

        // Verifica se os componentes de resultado apareceram
        const scoreValue = page.locator('span[class*="scoreValue"]');
        await expect(scoreValue).toBeVisible();
        await expect(page.locator('text=Título de Exemplo para SEO')).toBeVisible();

        // Verifica se os itens de sucesso aparecem (agora no topo)
        const firstIssue = page.locator('ul[class*="list"]').first();
        await expect(firstIssue).toContainText('O título tem um bom tamanho');

        // Verifica os títulos das seções atualizadas
        await expect(page.locator('text=Auditorias Passadas')).toBeVisible();
        await expect(page.locator('text=Diagnósticos e Melhorias')).toBeVisible();

        // Verifica Preview do Google
        await expect(page.locator('text=Prévia aproximada no Google')).toBeVisible();

        // Verifica Preview Social
        await expect(page.locator('text=Prévia aproximada em redes sociais')).toBeVisible();
    });

    test('Deve exibir mensagem de erro quando a API falha', async ({ page }) => {
        await page.route('**/api/analyze', async (route) => {
            await route.fulfill({
                status: 502,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Falha ao buscar a página (502 Bad Gateway).' }),
            });
        });

        await page.fill('input#url', 'https://broken-site.com');
        await page.click('button[type="submit"]');

        const errorMessage = page.locator('p[class*="error"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toHaveText('Falha ao buscar a página (502 Bad Gateway).');
    });
});

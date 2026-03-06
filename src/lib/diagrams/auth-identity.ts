import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createNode, flashNode, createBadge, flyBadge } from '@/lib/helpers';

export const authIdentityDiagrams: DiagramDef[] = [
  // 0: JWT Token Lifecycle
  {
    title: 'JWT Token Lifecycle',
    desc: 'Issue, verify, expire, and refresh JSON Web Tokens',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const client = createNode(canvas, 30, 120, 100, 'Client', 'browser/app', 'node-purple');
      const authServer = createNode(canvas, cx / 3 - 50, 50, 130, 'Auth Server', 'POST /login', 'node-red');
      const apiServer = createNode(canvas, cx * 2 / 3 - 50, 50, 130, 'API Server', 'verify JWT', 'node-blue');
      const refresh = createNode(canvas, cx / 3 - 50, 210, 130, 'Refresh Endpoint', 'POST /refresh', 'node-yellow');
      const resource = createNode(canvas, cx - 160, 120, 130, 'Protected Resource', 'user data', 'node-green');

      const steps: (() => void)[] = [
        () => {
          flashNode(client, 400);
          const b = createBadge(canvas, { x: 130, y: 130, text: 'credentials', color: '#7c6af7' });
          flyBadge(b, cx / 3 - 50, 70, 600);
          log('info', '[Client] POST /login {email, password}');
        },
        () => {
          flashNode(authServer, 400);
          log('ok', '[Auth] credentials valid \u2192 generating JWT');
        },
        () => {
          const b = createBadge(canvas, { x: cx / 3 + 80, y: 70, text: 'JWT', color: '#00d4aa' });
          flyBadge(b, 130, 130, 600);
          log('ok', '[Auth\u2192Client] access_token=eyJhbG... exp:3600s, refresh_token=rf_...');
        },
        () => {
          flashNode(client, 400);
          const b = createBadge(canvas, { x: 130, y: 130, text: 'Bearer JWT', color: '#4fc3f7' });
          flyBadge(b, cx * 2 / 3 - 50, 70, 600);
          log('info', '[Client] GET /api/data Authorization: Bearer eyJhbG...');
        },
        () => {
          flashNode(apiServer, 400);
          log('info', '[API] verifying signature, checking exp claim');
        },
        () => {
          flashNode(resource, 400);
          const b = createBadge(canvas, { x: cx * 2 / 3 + 80, y: 70, text: '200 OK', color: '#00d4aa' });
          flyBadge(b, cx - 160, 130, 500);
          log('ok', '[API\u2192Client] 200 OK { user data } \u2713 token valid');
        },
        () => {
          log('warn', '[Client] token expired (exp claim passed)');
        },
        () => {
          flashNode(client, 400);
          const b = createBadge(canvas, { x: 130, y: 140, text: 'refresh_token', color: '#ffd166' });
          flyBadge(b, cx / 3 - 50, 220, 600);
          log('info', '[Client] POST /refresh {refresh_token: rf_...}');
        },
        () => {
          flashNode(refresh, 400);
          log('ok', '[Auth] refresh token valid \u2192 issuing new JWT');
        },
        () => {
          const b = createBadge(canvas, { x: cx / 3 + 80, y: 220, text: 'new JWT', color: '#00d4aa' });
          flyBadge(b, 130, 140, 600);
          log('ok', '[Auth\u2192Client] new access_token issued, cycle continues');
        },
      ];

      let si = 0;
      const tick = (): void => {
        steps[si % steps.length]();
        si++;
      };

      return { tick, interval: 1200 };
    },
  },

  // 1: SAML SSO Flow
  {
    title: 'SAML SSO Flow',
    desc: 'Service Provider \u2194 Identity Provider SAML assertion exchange',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const user = createNode(canvas, cx / 2 - 50, 20, 100, 'User', 'browser', 'node-purple');
      const sp = createNode(canvas, 60, 150, 140, 'Service Provider', 'app.example.com', 'node-blue');
      const idp = createNode(canvas, cx - 200, 150, 140, 'Identity Provider', 'idp.corp.com', 'node-orange');
      const session = createNode(canvas, cx / 2 - 70, 270, 140, 'Authenticated Session', 'SAML assertion', 'node-green');

      const steps: (() => void)[] = [
        () => {
          flashNode(user, 400);
          log('info', '[User] navigates to app.example.com/dashboard');
        },
        () => {
          flashNode(sp, 400);
          log('info', '[SP] user not authenticated \u2192 generate SAML AuthnRequest');
        },
        () => {
          const b = createBadge(canvas, { x: 200, y: 160, text: 'AuthnRequest', color: '#4fc3f7' });
          flyBadge(b, cx - 200, 160, 700);
          log('info', '[SP\u2192IdP] 302 redirect with SAMLRequest (base64 encoded)');
        },
        () => {
          flashNode(idp, 400);
          log('warn', '[IdP] prompting user for credentials (login page)');
        },
        () => {
          log('info', '[IdP] user authenticated via LDAP/AD backend');
        },
        () => {
          flashNode(idp, 400);
          log('info', '[IdP] generating SAML Response with signed assertion');
        },
        () => {
          const b = createBadge(canvas, { x: cx - 200, y: 170, text: 'SAMLResponse', color: '#ff6b35' });
          flyBadge(b, 200, 170, 700);
          log('info', '[IdP\u2192SP] POST /acs with SAMLResponse (signed XML)');
        },
        () => {
          flashNode(sp, 400);
          log('ok', '[SP] validating XML signature against IdP certificate');
        },
        () => {
          flashNode(sp, 400);
          log('ok', '[SP] assertion valid: NameID=user@corp.com, roles=[admin]');
        },
        () => {
          flashNode(session, 400);
          log('ok', '[SP] session created \u2713 user redirected to /dashboard');
        },
      ];

      let si = 0;
      const tick = (): void => {
        steps[si % steps.length]();
        si++;
      };

      return { tick, interval: 1300 };
    },
  },

  // 2: RBAC Access Control
  {
    title: 'RBAC Access Control',
    desc: 'Role-based policy evaluation \u2014 users, roles, permissions, resources',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const users: HTMLDivElement[] = [
        createNode(canvas, 30, 40, 100, 'Alice', 'role: Admin', 'node-purple'),
        createNode(canvas, 30, 120, 100, 'Bob', 'role: Editor', 'node-blue'),
        createNode(canvas, 30, 200, 100, 'Carol', 'role: Viewer', 'node-yellow'),
      ];

      const engine = createNode(canvas, cx / 2 - 70, 120, 140, 'Policy Engine', 'evaluate RBAC', 'node-red');

      const resources: HTMLDivElement[] = [
        createNode(canvas, cx - 160, 40, 130, 'DELETE /users', 'admin only', 'node-red'),
        createNode(canvas, cx - 160, 120, 130, 'PUT /articles', 'editor+', 'node-orange'),
        createNode(canvas, cx - 160, 200, 130, 'GET /articles', 'all roles', 'node-green'),
      ];

      const matrix: Record<string, string[]> = {
        Admin: ['DELETE /users', 'PUT /articles', 'GET /articles'],
        Editor: ['PUT /articles', 'GET /articles'],
        Viewer: ['GET /articles'],
      };

      const userNames: string[] = ['Alice', 'Bob', 'Carol'];
      const roles: string[] = ['Admin', 'Editor', 'Viewer'];
      const resourceNames: string[] = ['DELETE /users', 'PUT /articles', 'GET /articles'];

      const tick = (): void => {
        const ui = Math.floor(Math.random() * 3);
        const ri = Math.floor(Math.random() * 3);
        const role = roles[ui];
        const resource = resourceNames[ri];
        const allowed = matrix[role].includes(resource);

        flashNode(users[ui], 500);
        flashNode(engine, 500);
        flashNode(resources[ri], 500);

        if (allowed) {
          log('ok', `[RBAC] ${userNames[ui]} (${role}) \u2192 ${resource} \u2192 ALLOW \u2713`);
        } else {
          log('err', `[RBAC] ${userNames[ui]} (${role}) \u2192 ${resource} \u2192 DENY \u2717 insufficient permissions`);
        }
      };

      return { tick, interval: 1000 };
    },
  },

  // 3: Certificate Chain Validation
  {
    title: 'Certificate Chain Validation',
    desc: 'Root CA \u2192 Intermediate CA \u2192 Leaf cert trust chain verification',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const rootCA = createNode(canvas, cx / 2 - 65, 20, 130, 'Root CA', 'self-signed, trusted', 'node-green');
      const intermediateCA = createNode(canvas, cx / 2 - 65, 110, 130, 'Intermediate CA', 'signed by Root CA', 'node-blue');
      const leafCert = createNode(canvas, cx / 2 - 65, 200, 130, 'Leaf Certificate', '*.example.com', 'node-yellow');
      const server = createNode(canvas, cx / 2 - 65, 290, 130, 'Server', 'TLS endpoint', 'node-purple');
      const client = createNode(canvas, 30, 200, 100, 'Client', 'verifier', 'node-orange');

      // Trust store indicator
      const trustStore = document.createElement('div');
      trustStore.style.cssText = 'position:absolute;right:30px;top:20px;padding:8px 14px;border:1px dashed rgba(0,212,170,.3);font-size:9px;color:var(--accent);letter-spacing:.06em';
      trustStore.textContent = 'Trust Store';
      canvas.appendChild(trustStore);

      const steps: (() => void)[] = [
        () => {
          flashNode(server, 400);
          log('info', '[TLS] server sends certificate chain to client');
        },
        () => {
          flashNode(leafCert, 400);
          const h = Math.random().toString(16).slice(2, 10);
          log('info', `[Verify] leaf cert: CN=*.example.com issuer=Intermediate CA serial:${h}`);
        },
        () => {
          flashNode(client, 400);
          log('info', '[Verify] checking leaf cert signature against Intermediate CA public key');
        },
        () => {
          flashNode(leafCert, 400);
          log('ok', '[Verify] leaf cert signature VALID \u2713');
        },
        () => {
          flashNode(intermediateCA, 400);
          log('info', '[Verify] checking Intermediate CA cert signed by Root CA');
        },
        () => {
          flashNode(intermediateCA, 400);
          log('ok', '[Verify] intermediate cert signature VALID \u2713');
        },
        () => {
          flashNode(rootCA, 400);
          log('info', '[Verify] Root CA found in local trust store');
        },
        () => {
          flashNode(rootCA, 400);
          log('ok', '[Verify] Root CA is self-signed and TRUSTED \u2713');
        },
        () => {
          log('info', '[Verify] checking certificate dates, revocation (OCSP/CRL)');
        },
        () => {
          flashNode(client, 500);
          log('ok', '[TLS] full chain verified \u2713 \u2014 secure connection established');
        },
      ];

      let si = 0;
      const tick = (): void => {
        steps[si % steps.length]();
        si++;
      };

      return { tick, interval: 1100 };
    },
  },
];

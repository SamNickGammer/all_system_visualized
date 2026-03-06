import type { DiagramDef, DiagramContext, DiagramInstance } from '@/lib/types';
import { createNode, flashNode, createBadge, flyBadge } from '@/lib/helpers';

export const networkingSecurityDiagrams: DiagramDef[] = [
  // 0: TCP 3-Way Handshake
  {
    title: 'TCP 3-Way Handshake',
    desc: 'SYN → SYN-ACK → ACK connection establishment',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      createNode(canvas, 30, 130, 110, 'Client', '192.168.1.1', 'node-purple');
      createNode(canvas, cx - 150, 130, 130, 'Server', '10.0.0.1:443', 'node-blue');

      // timelines
      const tl = document.createElement('div');
      tl.style.cssText = `position:absolute;left:140px;top:100px;width:2px;height:200px;background:rgba(124,106,247,.2)`;
      canvas.appendChild(tl);
      const tr = document.createElement('div');
      tr.style.cssText = `position:absolute;right:155px;top:100px;width:2px;height:200px;background:rgba(79,195,247,.2)`;
      canvas.appendChild(tr);

      const steps: { msg: string; from: number; to: number; y: number; color: string; log: string }[] = [
        { msg: 'SYN', from: 140, to: cx - 155, y: 110, color: '#7c6af7', log: '[Client] SYN seq=1000' },
        { msg: 'SYN-ACK', from: cx - 155, to: 140, y: 160, color: '#4fc3f7', log: '[Server] SYN-ACK seq=2000 ack=1001' },
        { msg: 'ACK', from: 140, to: cx - 155, y: 210, color: '#00d4aa', log: '[Client] ACK seq=1001 ack=2001 \u2713 Connected' },
        { msg: 'DATA', from: 140, to: cx - 155, y: 260, color: '#ffd166', log: '[Client] HTTP GET / (TLS handshake follows)' },
      ];

      let si = 0;
      const tick = (): void => {
        const s = steps[si % steps.length];
        const b = createBadge(canvas, { x: s.from, y: s.y, text: s.msg, color: s.color });
        flyBadge(b, s.to, s.y, 600);
        log(si % steps.length === 2 ? 'ok' : 'info', s.log);
        si++;
      };

      return { tick, interval: 1200 };
    },
  },

  // 1: DNS Resolution
  {
    title: 'DNS Resolution',
    desc: 'Recursive DNS lookup chain from stub resolver to authoritative NS',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const nodes: HTMLDivElement[] = [
        createNode(canvas, 30, 20, 100, 'Client', 'stub resolver', 'node-purple'),
        createNode(canvas, cx / 4, 20, 120, 'Recursive NS', 'ISP resolver', 'node-blue'),
        createNode(canvas, cx / 2, 20, 110, 'Root NS', '. zone', 'node-orange'),
        createNode(canvas, cx * 3 / 4, 20, 110, 'TLD NS', '.com zone', 'node-yellow'),
        createNode(canvas, cx - 140, 20, 120, 'Auth NS', 'example.com', 'node-green'),
      ];

      const steps: [number, number, string, string, string][] = [
        [0, 1, 'example.com?', '#7c6af7', '[Client\u2192RecursiveNS] query: example.com A'],
        [1, 2, 'example.com?', '#4fc3f7', '[RecursiveNS\u2192RootNS] referral to .com TLD'],
        [2, 3, '.com NS?', '#ff6b35', '[RootNS\u2192TLD] referral to example.com NS'],
        [3, 4, 'example.com A?', '#ffd166', '[TLD\u2192AuthNS] direct query'],
        [4, 1, '93.184.x.x', '#00d4aa', '[AuthNS\u2192RecursiveNS] A=93.184.216.34 TTL=3600'],
        [1, 0, '93.184.216.34', '#00d4aa', '[RecursiveNS\u2192Client] \u2713 resolved + cached'],
      ];

      let si = 0;

      const getCenter = (i: number): { x: number; y: number } => {
        const r = nodes[i].getBoundingClientRect();
        const cr = canvas.getBoundingClientRect();
        return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2 };
      };

      const tick = (): void => {
        const [a, b, msg, col, logmsg] = steps[si % steps.length];
        flashNode(nodes[a], 400);
        flashNode(nodes[b], 400);
        const ca = getCenter(a);
        const cb = getCenter(b);
        const bel = createBadge(canvas, { x: ca.x - 20, y: ca.y + 20, text: msg, color: col });
        flyBadge(bel, cb.x - 20, cb.y + 20, 700);
        log(si % steps.length === 5 ? 'ok' : 'info', logmsg);
        si++;
      };

      return { tick, interval: 1300 };
    },
  },

  // 2: OAuth2 Auth Flow
  {
    title: 'OAuth2 Auth Flow',
    desc: 'Authorization Code flow \u2014 browser, auth server, resource server',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const browser = createNode(canvas, 30, 120, 110, 'Browser', 'user-agent', 'node-purple');
      const auth = createNode(canvas, cx / 2 - 70, 120, 140, 'Auth Server', 'accounts.example', 'node-yellow');
      const res = createNode(canvas, cx - 160, 120, 140, 'Resource Server', 'api.example', 'node-green');
      createNode(canvas, 30, 230, 110, 'User', 'human', 'node-orange');

      const steps: (() => void)[] = [
        () => { flashNode(auth, 400); log('info', '[Browser\u2192AuthServer] GET /authorize?response_type=code&client_id=...'); },
        () => { log('warn', '[AuthServer] prompt user login + consent screen'); },
        () => { flashNode(browser, 400); log('info', '[AuthServer\u2192Browser] 302 redirect?code=AUTH_CODE'); },
        () => { flashNode(auth, 400); log('info', '[Browser\u2192AuthServer] POST /token code=AUTH_CODE client_secret=...'); },
        () => { flashNode(browser, 400); log('ok', '[AuthServer\u2192Browser] access_token=JWT refresh_token=...'); },
        () => { flashNode(res, 400); log('info', '[Browser\u2192ResourceServer] GET /api/data Authorization: Bearer JWT'); },
        () => { flashNode(browser, 400); log('ok', '[ResourceServer\u2192Browser] 200 OK { user data }'); },
      ];

      let si = 0;
      const tick = (): void => {
        steps[si % steps.length]();
        si++;
      };

      return { tick, interval: 1200 };
    },
  },

  // 3: Firewall Packet Filtering
  {
    title: 'Firewall Packet Filtering',
    desc: 'Stateful firewall allowing and dropping packets based on rules',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      createNode(canvas, 30, 130, 100, 'Internet', 'untrusted', 'node-red');
      const fw = createNode(canvas, cx / 2 - 60, 130, 120, 'Firewall', 'stateful', 'node-yellow');
      createNode(canvas, cx - 140, 60, 120, 'Web Server', 'port 443', 'node-green');
      createNode(canvas, cx - 140, 130, 120, 'App Server', 'port 8080', 'node-blue');
      createNode(canvas, cx - 140, 200, 120, 'DB Server', 'port 5432', 'node-orange');

      const rules: { port: string; allow: boolean; dst: string }[] = [
        { port: '443', allow: true, dst: 'Web Server' },
        { port: '8080', allow: false, dst: 'App Server' },
        { port: '22', allow: false, dst: 'SSH' },
        { port: '443', allow: true, dst: 'Web Server' },
        { port: '5432', allow: false, dst: 'DB Server' },
        { port: '80', allow: true, dst: 'Web Server' },
        { port: '3389', allow: false, dst: 'RDP' },
      ];

      let ri = 0;
      const tick = (): void => {
        const r = rules[ri % rules.length];
        ri++;
        flashNode(fw, 400);
        if (r.allow) {
          log('ok', `[FW] ALLOW TCP:${r.port} \u2192 ${r.dst} (rule matched)`);
        } else {
          log('err', `[FW] DROP TCP:${r.port} \u2192 ${r.dst} (no matching rule)`);
        }
      };

      return { tick, interval: 900 };
    },
  },

  // 4: VPN Tunnel
  {
    title: 'VPN Tunnel',
    desc: 'Encrypted tunnel routing traffic between client and private network',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const client = createNode(canvas, 30, 130, 110, 'Client', '10.8.0.2', 'node-purple');
      const vpnServer = createNode(canvas, cx / 2 - 60, 130, 120, 'VPN Server', '10.0.0.1', 'node-yellow');
      const internal = createNode(canvas, cx - 160, 80, 130, 'Internal API', '192.168.1.10', 'node-green');
      createNode(canvas, cx / 2 - 50, 240, 100, 'Internet', 'ISP', 'node-red');

      // Tunnel indicator
      const tunnel = document.createElement('div');
      tunnel.style.cssText = `position:absolute;left:155px;top:118px;width:${cx / 2 - 155 - 60}px;height:52px;border:1px dashed rgba(255,209,102,.3);background:rgba(255,209,102,.03)`;
      canvas.appendChild(tunnel);

      const tlabel = document.createElement('div');
      tlabel.style.cssText = 'position:absolute;left:160px;top:103px;font-size:8px;color:rgba(255,209,102,.5);letter-spacing:.08em';
      tlabel.textContent = '// encrypted tunnel';
      canvas.appendChild(tlabel);

      const steps: (() => void)[] = [
        () => { flashNode(client, 400); log('info', '[Client] encrypt payload \u2192 TUN0 interface'); },
        () => { flashNode(vpnServer, 400); log('info', '[VPN] receive encrypted pkt, decrypt, forward'); },
        () => { flashNode(internal, 400); log('ok', '[Internal] 192.168.1.10 receives request (trusted)'); },
        () => { flashNode(vpnServer, 400); log('info', '[VPN] encrypt response \u2192 client tunnel'); },
        () => { flashNode(client, 400); log('ok', '[Client] decrypted response received \u2713'); },
      ];

      let si = 0;
      const tick = (): void => {
        steps[si % steps.length]();
        si++;
      };

      return { tick, interval: 1000 };
    },
  },

  // 5: TLS 1.3 Handshake
  {
    title: 'TLS 1.3 Handshake',
    desc: '1-RTT handshake \u2014 ClientHello, ServerHello, encrypted extensions, finished',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      createNode(canvas, 30, 100, 110, 'Client', 'browser', 'node-purple');
      createNode(canvas, cx - 150, 100, 130, 'Server', 'TLS 1.3', 'node-blue');

      const tl = document.createElement('div');
      tl.style.cssText = `position:absolute;left:140px;top:80px;width:2px;height:220px;background:rgba(124,106,247,.2)`;
      canvas.appendChild(tl);
      const tr = document.createElement('div');
      tr.style.cssText = `position:absolute;right:155px;top:80px;width:2px;height:220px;background:rgba(79,195,247,.2)`;
      canvas.appendChild(tr);

      const steps: { msg: string; from: number; to: number; y: number; color: string; log: string }[] = [
        { msg: 'ClientHello', from: 140, to: cx - 155, y: 90, color: '#7c6af7', log: '[Client] ClientHello + key_share(x25519) + supported_ciphers' },
        { msg: 'ServerHello', from: cx - 155, to: 140, y: 130, color: '#4fc3f7', log: '[Server] ServerHello + key_share \u2192 handshake keys derived' },
        { msg: 'EncExt+Cert', from: cx - 155, to: 140, y: 170, color: '#ffd166', log: '[Server] {EncryptedExtensions, Certificate, CertVerify, Finished}' },
        { msg: 'Finished', from: 140, to: cx - 155, y: 210, color: '#00d4aa', log: '[Client] Finished \u2014 handshake complete, 0-RTT possible next time' },
        { msg: 'App Data', from: 140, to: cx - 155, y: 250, color: '#ff6b35', log: '[Client] encrypted application data flowing \u2713' },
        { msg: 'App Data', from: cx - 155, to: 140, y: 280, color: '#ff6b35', log: '[Server] encrypted response \u2713 \u2014 TLS 1.3 session active' },
      ];

      let si = 0;
      const tick = (): void => {
        const s = steps[si % steps.length];
        const b = createBadge(canvas, { x: s.from, y: s.y, text: s.msg, color: s.color });
        flyBadge(b, s.to, s.y, 600);
        log(si % steps.length >= 3 ? 'ok' : 'info', s.log);
        si++;
      };

      return { tick, interval: 1200 };
    },
  },

  // 6: BGP Route Propagation
  {
    title: 'BGP Route Propagation',
    desc: 'Autonomous Systems exchange route announcements via BGP peering',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const nodes: HTMLDivElement[] = [
        createNode(canvas, cx / 2 - 55, 20, 110, 'AS 64512', 'ISP-A', 'node-green'),
        createNode(canvas, 40, 150, 110, 'AS 64513', 'ISP-B', 'node-blue'),
        createNode(canvas, cx - 150, 150, 110, 'AS 64514', 'ISP-C', 'node-purple'),
        createNode(canvas, cx / 2 - 55, 260, 110, 'AS 64515', 'Enterprise', 'node-orange'),
      ];

      const asNames: string[] = ['AS64512', 'AS64513', 'AS64514', 'AS64515'];

      const announcements: [number, number, string, string][] = [
        [0, 1, '10.0.0.0/8', '[64512]'],
        [1, 3, '10.0.0.0/8', '[64513,64512]'],
        [0, 2, '172.16.0.0/12', '[64512]'],
        [2, 3, '172.16.0.0/12', '[64514,64512]'],
        [3, 1, '203.0.113.0/24', '[64515]'],
        [1, 0, '203.0.113.0/24', '[64513,64515]'],
      ];

      let step = 0;
      const tick = (): void => {
        const [from, to, prefix, path] = announcements[step % announcements.length];
        flashNode(nodes[from], 500);
        flashNode(nodes[to], 500);
        log('info', `[${asNames[from]}\u2192${asNames[to]}] UPDATE prefix:${prefix} AS_PATH:${path}`);
        if (step % 3 === 2) log('ok', `[${asNames[to]}] route installed in RIB, best path selected`);
        step++;
      };

      return { tick, interval: 1100 };
    },
  },

  // 7: mTLS Mutual Authentication
  {
    title: 'mTLS Mutual Auth',
    desc: 'Bidirectional certificate exchange \u2014 both client and server verify each other',
    init(ctx: DiagramContext): DiagramInstance {
      const { canvas, log, clearLog } = ctx;
      clearLog();
      const cx = canvas.offsetWidth;

      const client = createNode(canvas, 30, 130, 120, 'Client', 'has client cert', 'node-purple');
      const server = createNode(canvas, cx - 160, 130, 130, 'Server', 'has server cert', 'node-blue');
      const ca = createNode(canvas, cx / 2 - 50, 20, 100, 'CA', 'trust anchor', 'node-green');

      const steps: (() => void)[] = [
        () => { flashNode(client, 400); log('info', '[Client] initiating mTLS handshake'); },
        () => { flashNode(server, 400); log('info', '[Server] sending server certificate + CertificateRequest'); },
        () => { flashNode(client, 400); flashNode(ca, 400); log('info', '[Client] verifying server cert against CA'); },
        () => { log('ok', '[Client] server cert VALID \u2713 \u2014 server identity confirmed'); },
        () => { flashNode(client, 400); log('info', '[Client] sending client certificate to server'); },
        () => { flashNode(server, 400); flashNode(ca, 400); log('info', '[Server] verifying client cert against CA'); },
        () => { log('ok', '[Server] client cert VALID \u2713 \u2014 client identity confirmed'); },
        () => { flashNode(client, 500); flashNode(server, 500); log('ok', '[mTLS] mutual trust established \u2713 encrypted channel active'); },
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

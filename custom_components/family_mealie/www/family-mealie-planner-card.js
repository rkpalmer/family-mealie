/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const q = globalThis, ie = q.ShadowRoot && (q.ShadyCSS === void 0 || q.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ae = Symbol(), ce = /* @__PURE__ */ new WeakMap();
let be = class {
  constructor(t, i, a) {
    if (this._$cssResult$ = !0, a !== ae) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (ie && t === void 0) {
      const a = i !== void 0 && i.length === 1;
      a && (t = ce.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), a && ce.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ee = (e) => new be(typeof e == "string" ? e : e + "", void 0, ae), Ie = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((a, r, s) => a + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[s + 1], e[0]);
  return new be(i, e, ae);
}, Ae = (e, t) => {
  if (ie) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const a = document.createElement("style"), r = q.litNonce;
    r !== void 0 && a.setAttribute("nonce", r), a.textContent = i.cssText, e.appendChild(a);
  }
}, pe = ie ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const a of t.cssRules) i += a.cssText;
  return Ee(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ce, defineProperty: Pe, getOwnPropertyDescriptor: Le, getOwnPropertyNames: Oe, getOwnPropertySymbols: Ne, getPrototypeOf: Ue } = Object, Y = globalThis, de = Y.trustedTypes, ze = de ? de.emptyScript : "", Fe = Y.reactiveElementPolyfillSupport, O = (e, t) => e, V = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? ze : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, re = (e, t) => !Ce(e, t), he = { attribute: !0, type: String, converter: V, reflect: !1, useDefault: !1, hasChanged: re };
Symbol.metadata ??= Symbol("metadata"), Y.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let k = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = he) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const a = Symbol(), r = this.getPropertyDescriptor(t, a, i);
      r !== void 0 && Pe(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, a) {
    const { get: r, set: s } = Le(this.prototype, t) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: r, set(n) {
      const m = r?.call(this);
      s?.call(this, n), this.requestUpdate(t, m, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? he;
  }
  static _$Ei() {
    if (this.hasOwnProperty(O("elementProperties"))) return;
    const t = Ue(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(O("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(O("properties"))) {
      const i = this.properties, a = [...Oe(i), ...Ne(i)];
      for (const r of a) this.createProperty(r, i[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [a, r] of i) this.elementProperties.set(a, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, a] of this.elementProperties) {
      const r = this._$Eu(i, a);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const a = new Set(t.flat(1 / 0).reverse());
      for (const r of a) i.unshift(pe(r));
    } else t !== void 0 && i.push(pe(t));
    return i;
  }
  static _$Eu(t, i) {
    const a = i.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const a of i.keys()) this.hasOwnProperty(a) && (t.set(a, this[a]), delete this[a]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ae(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, a) {
    this._$AK(t, a);
  }
  _$ET(t, i) {
    const a = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, a);
    if (r !== void 0 && a.reflect === !0) {
      const s = (a.converter?.toAttribute !== void 0 ? a.converter : V).toAttribute(i, a.type);
      this._$Em = t, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const a = this.constructor, r = a._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const s = a.getPropertyOptions(r), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : V;
      this._$Em = r;
      const m = n.fromAttribute(i, s.type);
      this[r] = m ?? this._$Ej?.get(r) ?? m, this._$Em = null;
    }
  }
  requestUpdate(t, i, a, r = !1, s) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (s = this[t]), a ??= n.getPropertyOptions(t), !((a.hasChanged ?? re)(s, i) || a.useDefault && a.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, a)))) return;
      this.C(t, i, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: a, reflect: r, wrapped: s }, n) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? i ?? this[t]), s !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || a || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, s] of this._$Ep) this[r] = s;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [r, s] of a) {
        const { wrapped: n } = s, m = this[r];
        n !== !0 || this._$AL.has(r) || m === void 0 || this.C(r, void 0, s, m);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((a) => a.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (a) {
      throw t = !1, this._$EM(), a;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
k.elementStyles = [], k.shadowRootOptions = { mode: "open" }, k[O("elementProperties")] = /* @__PURE__ */ new Map(), k[O("finalized")] = /* @__PURE__ */ new Map(), Fe?.({ ReactiveElement: k }), (Y.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = globalThis, ue = (e) => e, W = se.trustedTypes, me = W ? W.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, we = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, Se = "?" + S, He = `<${Se}>`, D = document, z = () => D.createComment(""), F = (e) => e === null || typeof e != "object" && typeof e != "function", ne = Array.isArray, je = (e) => ne(e) || typeof e?.[Symbol.iterator] == "function", X = `[ 	
\f\r]`, C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ge = /-->/g, fe = />/g, R = RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ye = /'/g, ve = /"/g, _e = /^(?:script|style|textarea|title)$/i, Be = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), l = Be(1), I = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), xe = /* @__PURE__ */ new WeakMap(), T = D.createTreeWalker(D, 129);
function Re(e, t) {
  if (!ne(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return me !== void 0 ? me.createHTML(t) : t;
}
const qe = (e, t) => {
  const i = e.length - 1, a = [];
  let r, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = C;
  for (let m = 0; m < i; m++) {
    const u = e[m];
    let y, x, g = -1, b = 0;
    for (; b < u.length && (n.lastIndex = b, x = n.exec(u), x !== null); ) b = n.lastIndex, n === C ? x[1] === "!--" ? n = ge : x[1] !== void 0 ? n = fe : x[2] !== void 0 ? (_e.test(x[2]) && (r = RegExp("</" + x[2], "g")), n = R) : x[3] !== void 0 && (n = R) : n === R ? x[0] === ">" ? (n = r ?? C, g = -1) : x[1] === void 0 ? g = -2 : (g = n.lastIndex - x[2].length, y = x[1], n = x[3] === void 0 ? R : x[3] === '"' ? ve : ye) : n === ve || n === ye ? n = R : n === ge || n === fe ? n = C : (n = R, r = void 0);
    const w = n === R && e[m + 1].startsWith("/>") ? " " : "";
    s += n === C ? u + He : g >= 0 ? (a.push(y), u.slice(0, g) + we + u.slice(g) + S + w) : u + S + (g === -2 ? m : w);
  }
  return [Re(e, s + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), a];
};
class H {
  constructor({ strings: t, _$litType$: i }, a) {
    let r;
    this.parts = [];
    let s = 0, n = 0;
    const m = t.length - 1, u = this.parts, [y, x] = qe(t, i);
    if (this.el = H.createElement(y, a), T.currentNode = this.el.content, i === 2 || i === 3) {
      const g = this.el.content.firstChild;
      g.replaceWith(...g.childNodes);
    }
    for (; (r = T.nextNode()) !== null && u.length < m; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const g of r.getAttributeNames()) if (g.endsWith(we)) {
          const b = x[n++], w = r.getAttribute(g).split(S), B = /([.?@])?(.*)/.exec(b);
          u.push({ type: 1, index: s, name: B[2], strings: w, ctor: B[1] === "." ? Ve : B[1] === "?" ? We : B[1] === "@" ? Ye : G }), r.removeAttribute(g);
        } else g.startsWith(S) && (u.push({ type: 6, index: s }), r.removeAttribute(g));
        if (_e.test(r.tagName)) {
          const g = r.textContent.split(S), b = g.length - 1;
          if (b > 0) {
            r.textContent = W ? W.emptyScript : "";
            for (let w = 0; w < b; w++) r.append(g[w], z()), T.nextNode(), u.push({ type: 2, index: ++s });
            r.append(g[b], z());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Se) u.push({ type: 2, index: s });
      else {
        let g = -1;
        for (; (g = r.data.indexOf(S, g + 1)) !== -1; ) u.push({ type: 7, index: s }), g += S.length - 1;
      }
      s++;
    }
  }
  static createElement(t, i) {
    const a = D.createElement("template");
    return a.innerHTML = t, a;
  }
}
function A(e, t, i = e, a) {
  if (t === I) return t;
  let r = a !== void 0 ? i._$Co?.[a] : i._$Cl;
  const s = F(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== s && (r?._$AO?.(!1), s === void 0 ? r = void 0 : (r = new s(e), r._$AT(e, i, a)), a !== void 0 ? (i._$Co ??= [])[a] = r : i._$Cl = r), r !== void 0 && (t = A(e, r._$AS(e, t.values), r, a)), t;
}
class Ke {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: a } = this._$AD, r = (t?.creationScope ?? D).importNode(i, !0);
    T.currentNode = r;
    let s = T.nextNode(), n = 0, m = 0, u = a[0];
    for (; u !== void 0; ) {
      if (n === u.index) {
        let y;
        u.type === 2 ? y = new j(s, s.nextSibling, this, t) : u.type === 1 ? y = new u.ctor(s, u.name, u.strings, this, t) : u.type === 6 && (y = new Ge(s, this, t)), this._$AV.push(y), u = a[++m];
      }
      n !== u?.index && (s = T.nextNode(), n++);
    }
    return T.currentNode = D, r;
  }
  p(t) {
    let i = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(t, a, i), i += a.strings.length - 2) : a._$AI(t[i])), i++;
  }
}
class j {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, a, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = a, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && t?.nodeType === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = A(this, t, i), F(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== I && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : je(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && F(this._$AH) ? this._$AA.nextSibling.data = t : this.T(D.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: a } = t, r = typeof a == "number" ? this._$AC(t) : (a.el === void 0 && (a.el = H.createElement(Re(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const s = new Ke(r, this), n = s.u(this.options);
      s.p(i), this.T(n), this._$AH = s;
    }
  }
  _$AC(t) {
    let i = xe.get(t.strings);
    return i === void 0 && xe.set(t.strings, i = new H(t)), i;
  }
  k(t) {
    ne(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let a, r = 0;
    for (const s of t) r === i.length ? i.push(a = new j(this.O(z()), this.O(z()), this, this.options)) : a = i[r], a._$AI(s), r++;
    r < i.length && (this._$AR(a && a._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const a = ue(t).nextSibling;
      ue(t).remove(), t = a;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class G {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, a, r, s) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = s, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = h;
  }
  _$AI(t, i = this, a, r) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) t = A(this, t, i, 0), n = !F(t) || t !== this._$AH && t !== I, n && (this._$AH = t);
    else {
      const m = t;
      let u, y;
      for (t = s[0], u = 0; u < s.length - 1; u++) y = A(this, m[a + u], i, u), y === I && (y = this._$AH[u]), n ||= !F(y) || y !== this._$AH[u], y === h ? t = h : t !== h && (t += (y ?? "") + s[u + 1]), this._$AH[u] = y;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Ve extends G {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class We extends G {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Ye extends G {
  constructor(t, i, a, r, s) {
    super(t, i, a, r, s), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = A(this, t, i, 0) ?? h) === I) return;
    const a = this._$AH, r = t === h && a !== h || t.capture !== a.capture || t.once !== a.once || t.passive !== a.passive, s = t !== h && (a === h || r);
    r && this.element.removeEventListener(this.name, this, a), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ge {
  constructor(t, i, a) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    A(this, t);
  }
}
const Xe = se.litHtmlPolyfillSupport;
Xe?.(H, j), (se.litHtmlVersions ??= []).push("3.3.3");
const Je = (e, t, i) => {
  const a = i?.renderBefore ?? t;
  let r = a._$litPart$;
  if (r === void 0) {
    const s = i?.renderBefore ?? null;
    a._$litPart$ = r = new j(t.insertBefore(z(), s), s, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = globalThis;
class N extends k {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Je(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return I;
  }
}
N._$litElement$ = !0, N.finalized = !0, oe.litElementHydrateSupport?.({ LitElement: N });
const Ze = oe.litElementPolyfillSupport;
Ze?.({ LitElement: N });
(oe.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qe = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = { attribute: !0, type: String, converter: V, reflect: !1, hasChanged: re }, tt = (e = et, t, i) => {
  const { kind: a, metadata: r } = i;
  let s = globalThis.litPropertyMetadata.get(r);
  if (s === void 0 && globalThis.litPropertyMetadata.set(r, s = /* @__PURE__ */ new Map()), a === "setter" && ((e = Object.create(e)).wrapped = !0), s.set(i.name, e), a === "accessor") {
    const { name: n } = i;
    return { set(m) {
      const u = t.get.call(this);
      t.set.call(this, m), this.requestUpdate(n, u, e, !0, m);
    }, init(m) {
      return m !== void 0 && this.C(n, void 0, e, m), m;
    } };
  }
  if (a === "setter") {
    const { name: n } = i;
    return function(m) {
      const u = this[n];
      t.call(this, m), this.requestUpdate(n, u, e, !0, m);
    };
  }
  throw Error("Unsupported decorator location: " + a);
};
function Te(e) {
  return (t, i) => typeof i == "object" ? tt(e, t, i) : ((a, r, s) => {
    const n = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, a), n ? Object.getOwnPropertyDescriptor(r, s) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(e) {
  return Te({ ...e, state: !0, attribute: !1 });
}
var it = Object.defineProperty, at = Object.getOwnPropertyDescriptor, p = (e, t, i, a) => {
  for (var r = a > 1 ? void 0 : a ? at(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (r = (a ? n(t, i, r) : n(r)) || r);
  return a && r && it(t, i, r), r;
};
const L = ["breakfast", "lunch", "dinner"], rt = ["Leftovers:", "Eat Out:", "Freezer Meal:", "Kids:"], st = "family-mealie-planner-card:draft:v2", nt = /* @__PURE__ */ new Set([
  "view",
  "plannerOffsetDays",
  "search",
  "recipeCreateOpen",
  "recipeCreateMode",
  "recipeUrl",
  "manualRecipeName",
  "manualRecipeSource",
  "manualRecipeDescription",
  "manualRecipeServings",
  "manualRecipePrep",
  "manualRecipeCook",
  "manualRecipeTotal",
  "manualRecipeIngredients",
  "manualRecipeInstructions",
  "manualRecipeNotes",
  "manualParseIngredients",
  "addDialogOpen",
  "selectedSlot",
  "noteTitle",
  "noteText"
]);
let c = class extends N {
  constructor() {
    super(...arguments), this.config = { type: "custom:family-mealie-planner-card" }, this.view = "planner", this.recipes = [], this.mealPlan = [], this.shoppingLists = [], this.loading = !1, this.addDialogOpen = !1, this.recipeDialogOpen = !1, this.mealEditDate = "", this.mealEditEntryType = "", this.mealSaving = !1, this.recipeLoading = !1, this.search = "", this.noteTitle = "", this.noteText = "", this.noteEditTitle = "", this.noteEditText = "", this.plannerOffsetDays = 0, this.recipeCreateOpen = !1, this.recipeCreateMode = "url", this.recipeUrl = "", this.manualRecipeName = "", this.manualRecipeSource = "", this.manualRecipeDescription = "", this.manualRecipeServings = "", this.manualRecipePrep = "", this.manualRecipeCook = "", this.manualRecipeTotal = "", this.manualRecipeIngredients = "", this.manualRecipeInstructions = "", this.manualRecipeNotes = "", this.manualParseIngredients = !0, this.recipeSaving = !1, this.groceryText = "", this.newListName = "", this.draftRestored = !1, this.suppressMealClickUntil = 0, this.resetPlannerRange = async () => {
      this.plannerOffsetDays = 0, await this.reloadPlannerRange();
    }, this.toggleRecipeCreate = () => {
      this.recipeCreateOpen = !this.recipeCreateOpen, this.recipeCreateOpen && (this.recipeMessage = void 0);
    }, this.openDefaultAddDialog = () => {
      const e = this.daysToShow()[0] ?? K(/* @__PURE__ */ new Date()), t = this.entryTypes()[0] ?? L[0];
      this.openAddDialog({ date: M(e), entryType: t });
    }, this.planRecipeFromDialog = () => {
      const e = this.recipeDetail ?? this.selectedRecipeForDialog;
      e?.id && (this.closeRecipeDialog(), this.selectedMeal = void 0, this.selectedRecipeForDialog = void 0, this.recipeDetail = void 0, this.openAddDialog(this.defaultRecipePlanSlot(), e));
    }, this.closeAddDialog = () => {
      this.addDialogOpen = !1;
    }, this.closeRecipeDialog = () => {
      this.recipeDialogOpen = !1, this.mealSaving = !1;
    }, this.onMealEditDateInput = (e) => {
      this.mealEditDate = f(e);
    }, this.onMealEditEntryTypeInput = (e) => {
      this.mealEditEntryType = this.canonicalEntryType(f(e));
    }, this.moveMealPointer = (e) => {
      const t = this.pointerDrag;
      if (!t || t.pointerId !== e.pointerId) return;
      const i = Math.hypot(e.clientX - t.startX, e.clientY - t.startY);
      if (!t.active) {
        i > 10 && this.cancelMealPointer();
        return;
      }
      e.preventDefault();
    }, this.endMealPointer = (e) => {
      const t = this.pointerDrag;
      if (!t || t.pointerId !== e.pointerId || (t.holdTimer && window.clearTimeout(t.holdTimer), t.source.releasePointerCapture?.(e.pointerId), this.pointerDrag = void 0, !t.active)) return;
      e.preventDefault(), e.stopPropagation(), this.suppressMealClickUntil = Date.now() + 350;
      const i = this.dropTargetFromPoint(e.clientX, e.clientY);
      if (this.clearDraggingState(), !i) return;
      const a = this.mealPlan.find((r) => String(r.id) === t.mealId);
      a && this.moveMeal(a, i.date, i.entryType ?? a.entryType);
    }, this.cancelMealPointer = () => {
      this.pointerDrag?.holdTimer && window.clearTimeout(this.pointerDrag.holdTimer), this.pointerDrag?.source.releasePointerCapture?.(this.pointerDrag.pointerId), this.pointerDrag = void 0, this.clearDraggingState();
    }, this.onPlannerDragOver = (e) => {
      this.draggingMealId && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move"));
    }, this.onGroceryKeyDown = (e) => {
      e.key === "Enter" && this.addShoppingItem(e);
    };
  }
  setConfig(e) {
    if (!e || e.type !== "custom:family-mealie-planner-card")
      throw new Error("Invalid card type. Use custom:family-mealie-planner-card.");
    this.config = {
      title: "Meals",
      days: 7,
      entry_types: L,
      result_limit: 300,
      refresh_minutes: 15,
      ...e
    }, this.restartRefreshTimer();
  }
  connectedCallback() {
    super.connectedCallback(), this.restoreDraft(), this.restartRefreshTimer();
  }
  disconnectedCallback() {
    window.clearInterval(this.refreshTimer), window.clearTimeout(this.draftSaveTimer), super.disconnectedCallback();
  }
  firstUpdated() {
    this.refreshAll();
  }
  updated(e) {
    e.has("hass") && this.hass && this.recipes.length === 0 && this.mealPlan.length === 0 && this.refreshAll(), (e.has("addDialogOpen") || e.has("recipeDialogOpen") || e.has("mealEditEntryType") || e.has("selectedMeal") || e.has("selectedSlot")) && (this.syncNativeDialogs(), this.syncNativeSelects()), [...e.keys()].some((t) => nt.has(String(t))) && this.scheduleDraftSave();
  }
  getCardSize() {
    return 8;
  }
  render() {
    return l`
      <ha-card>
        <section class="shell">
          <header class="topbar">
            <div class="hero-icon"><ha-icon icon="mdi:silverware-fork-knife"></ha-icon></div>
            <div class="hero-copy">
              <p class="eyebrow">Family Mealie</p>
              <h2>${this.config.title}</h2>
              <p>${this.subtitle()}</p>
            </div>
            <div class="top-actions">
              ${this.view === "planner" ? l`
                    <button class="secondary action add-button" @click=${this.openDefaultAddDialog}>
                      <ha-icon icon="mdi:plus"></ha-icon>
                      <span>Add meal</span>
                    </button>
                  ` : h}
              <button class="icon-button refresh-button" title="Refresh" @click=${this.refreshAll} ?disabled=${this.loading}>
                <ha-icon class=${this.loading ? "spin" : ""} icon=${this.loading ? "mdi:loading" : "mdi:refresh"}></ha-icon>
              </button>
            </div>
          </header>

          <nav class="tabs">
            ${this.renderTab("planner", "Planner", "mdi:calendar-week-outline")}
            ${this.renderTab("recipes", "Recipes", "mdi:chef-hat")}
            ${this.renderTab("groceries", "Groceries", "mdi:cart-outline")}
          </nav>

          ${this.error ? l`<div class="notice error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>${this.error}</div>` : h}
          ${this.view === "planner" ? this.renderPlanner() : h}
          ${this.view === "recipes" ? this.renderRecipes() : h}
          ${this.view === "groceries" ? this.renderGroceries() : h}
        </section>
      </ha-card>

      ${this.renderAddDialog()} ${this.renderRecipeDialog()}
    `;
  }
  renderTab(e, t, i) {
    return l`
      <button class=${this.view === e ? "active" : ""} @click=${() => this.openView(e)}>
        <ha-icon icon=${i}></ha-icon>
        <span>${t}</span>
      </button>
    `;
  }
  renderPlanner() {
    const e = this.daysToShow();
    return l`
      <div class="planner-nav">
        <button class="plain" @click=${() => this.shiftPlannerRange(-this.rangeStepDays())}>Previous week</button>
        <button class="plain" @click=${this.resetPlannerRange} ?disabled=${this.plannerOffsetDays === 0}>This week</button>
        <button class="plain" @click=${() => this.shiftPlannerRange(this.rangeStepDays())}>Next week</button>
      </div>
      <div class="board" style=${`--day-count:${e.length}`}>
        ${e.map((t) => this.renderDay(t))}
      </div>
    `;
  }
  renderDay(e) {
    const t = M(e), i = this.hasMealsForDay(t);
    return l`
      <article
        class="day"
        data-drop-date=${t}
        @dragover=${this.onPlannerDragOver}
        @drop=${(a) => this.dropMeal(a, t)}
      >
        <div class="day-head">
          <span>${this.formatWeekday(e)}</span>
          <strong>${this.formatMonthDay(e)}</strong>
        </div>
        ${this.renderDropTargets(t)}
        <div class="meal-sections">
          ${i ? this.entryTypes().map((a) => this.renderMealSection(e, a)) : l`<div class="empty-day">No meals planned</div>`}
        </div>
      </article>
    `;
  }
  renderMealSection(e, t) {
    const i = M(e), a = this.mealsFor(i, t);
    return a.length ? l`
      <section
        class="meal-section"
        data-drop-date=${i}
        data-drop-entry-type=${t}
        @dragover=${this.onPlannerDragOver}
        @drop=${(r) => this.dropMeal(r, i, t)}
      >
        <header>
          <span>${P(t)}</span>
        </header>
        <div class="meal-list">
          ${a.map((r) => this.renderMealCard(r))}
        </div>
      </section>
    ` : h;
  }
  renderMealOption(e) {
    return l`
      <button
        type="button"
        class=${this.selectedRecipeKey(e) === this.selectedRecipeKey(this.selectedRecipe) ? "selected" : ""}
        @click=${() => this.chooseRecipe(e)}
      >
        ${e.image ? l`<img src=${e.image} alt="" loading="lazy" />` : l`<span class="thumb">${e.name.slice(0, 1)}</span>`}
        <span>${e.name}</span>
      </button>
    `;
  }
  renderMealCard(e) {
    return l`
      <button
        class="meal-pill"
        draggable="false"
        @pointerdown=${(t) => this.startMealPointer(t, e)}
        @pointermove=${this.moveMealPointer}
        @pointerup=${this.endMealPointer}
        @pointercancel=${this.cancelMealPointer}
        @click=${(t) => this.onMealCardClick(t, e)}
      >
        <strong>${e.title}</strong>
        ${e.text && e.text !== e.title ? l`<small>${e.text}</small>` : h}
      </button>
    `;
  }
  renderDropTargets(e) {
    return l`
      <div class="drop-targets">
        ${this.entryTypes().map(
      (t) => l`
            <button
              type="button"
              data-drop-date=${e}
              data-drop-entry-type=${t}
              @dragover=${this.onPlannerDragOver}
              @drop=${(i) => this.dropMeal(i, e, t)}
            >
              ${P(t)}
            </button>
          `
    )}
      </div>
    `;
  }
  renderRecipes() {
    const e = this.filteredRecipes();
    return l`
      <div class="recipe-toolbar">
        <label>
          Search recipes
          <input
            type="search"
            placeholder="Pasta, tacos, soup..."
            .value=${this.search}
            @input=${(t) => this.setSearch(f(t))}
          />
        </label>
        <button class="secondary" @click=${this.toggleRecipeCreate}>
          <ha-icon icon=${this.recipeCreateOpen ? "mdi:chevron-up" : "mdi:plus"}></ha-icon>
          <span>${this.recipeCreateOpen ? "Hide add recipe" : "Add recipe"}</span>
        </button>
      </div>

      ${this.recipeCreateOpen ? l`
            <section class="recipe-create-panel">
              <header>
                <h3>Add recipe</h3>
                <div class="mode-tabs">
                  <button class=${this.recipeCreateMode === "url" ? "active" : ""} @click=${() => this.setRecipeCreateMode("url")}>
                    <ha-icon icon="mdi:link-variant"></ha-icon>
                    <span>Import URL</span>
                  </button>
                  <button class=${this.recipeCreateMode === "manual" ? "active" : ""} @click=${() => this.setRecipeCreateMode("manual")}>
                    <ha-icon icon="mdi:pencil-outline"></ha-icon>
                    <span>Manual</span>
                  </button>
                </div>
              </header>
              ${this.recipeMessage ? l`<div class="success"><ha-icon icon="mdi:check-circle-outline"></ha-icon>${this.recipeMessage}</div>` : h}
              ${this.recipeCreateMode === "url" ? this.renderRecipeUrlCreate() : this.renderRecipeManualCreate()}
            </section>
          ` : this.recipeMessage ? l`<div class="success compact"><ha-icon icon="mdi:check-circle-outline"></ha-icon>${this.recipeMessage}</div>` : h}

      <div class="recipe-grid">
        ${e.map(
      (t) => l`
            <button class="recipe-tile" @click=${() => this.openRecipeSummaryDialog(t)}>
              ${t.image ? l`<img src=${t.image} alt="" loading="lazy" />` : l`<span class="thumb">${t.name.slice(0, 1)}</span>`}
              <span>${t.name}</span>
            </button>
          `
    )}
      </div>
    `;
  }
  renderRecipeUrlCreate() {
    return l`
      <div class="recipe-url-row">
        <label>
          Recipe URL
          <input
            type="url"
            placeholder="https://..."
            .value=${this.recipeUrl}
            @input=${(e) => this.recipeUrl = f(e)}
          />
        </label>
        <button class="primary" @click=${this.importRecipeUrl} ?disabled=${this.recipeSaving || !this.recipeUrl.trim()}>
          <ha-icon class=${this.recipeSaving ? "spin" : ""} icon=${this.recipeSaving ? "mdi:loading" : "mdi:import"}></ha-icon>
          <span>${this.recipeSaving ? "Importing" : "Import"}</span>
        </button>
      </div>
    `;
  }
  renderRecipeManualCreate() {
    return l`
      <div class="manual-recipe-form">
        <label>
          Name
          <input
            type="text"
            placeholder="Chicken soup"
            .value=${this.manualRecipeName}
            @input=${(e) => this.manualRecipeName = f(e)}
          />
        </label>
        <label>
          Source URL
          <input
            type="url"
            placeholder="https://..."
            .value=${this.manualRecipeSource}
            @input=${(e) => this.manualRecipeSource = f(e)}
          />
        </label>
        <label class="span-2">
          Description
          <textarea
            .value=${this.manualRecipeDescription}
            @input=${(e) => this.manualRecipeDescription = f(e)}
          ></textarea>
        </label>
        <div class="time-grid span-2">
          <label>
            Servings
            <input
              type="number"
              min="0"
              inputmode="numeric"
              .value=${this.manualRecipeServings}
              @input=${(e) => this.manualRecipeServings = f(e)}
            />
          </label>
          <label>
            Prep
            <input
              type="text"
              placeholder="15 min"
              .value=${this.manualRecipePrep}
              @input=${(e) => this.manualRecipePrep = f(e)}
            />
          </label>
          <label>
            Cook
            <input
              type="text"
              placeholder="30 min"
              .value=${this.manualRecipeCook}
              @input=${(e) => this.manualRecipeCook = f(e)}
            />
          </label>
          <label>
            Total
            <input
              type="text"
              placeholder="45 min"
              .value=${this.manualRecipeTotal}
              @input=${(e) => this.manualRecipeTotal = f(e)}
            />
          </label>
        </div>
        <label>
          Ingredients
          <textarea
            class="tall"
            .value=${this.manualRecipeIngredients}
            @input=${(e) => this.manualRecipeIngredients = f(e)}
          ></textarea>
        </label>
        <label>
          Instructions
          <textarea
            class="tall"
            .value=${this.manualRecipeInstructions}
            @input=${(e) => this.manualRecipeInstructions = f(e)}
          ></textarea>
        </label>
        <label class="span-2">
          Notes
          <textarea
            .value=${this.manualRecipeNotes}
            @input=${(e) => this.manualRecipeNotes = f(e)}
          ></textarea>
        </label>
        <label class="check-row span-2">
          <input
            type="checkbox"
            .checked=${this.manualParseIngredients}
            @change=${(e) => this.manualParseIngredients = e.currentTarget.checked}
          />
          <span>Use Mealie ingredient parser</span>
        </label>
        <footer class="span-2">
          <button class="primary" @click=${this.createManualRecipe} ?disabled=${this.recipeSaving || !this.manualRecipeName.trim()}>
            <ha-icon class=${this.recipeSaving ? "spin" : ""} icon=${this.recipeSaving ? "mdi:loading" : "mdi:content-save-outline"}></ha-icon>
            <span>${this.recipeSaving ? "Saving" : "Save recipe"}</span>
          </button>
        </footer>
      </div>
    `;
  }
  renderGroceries() {
    return l`
      <section class="grocery-layout">
        <aside class="list-rail">
          <div class="rail-head">
            <strong>Lists</strong>
            <button class="small secondary" @click=${this.createShoppingList} ?disabled=${!this.newListName.trim()}>
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>Create</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="New list"
            .value=${this.newListName}
            @input=${(e) => this.newListName = f(e)}
          />
          <div class="list-buttons">
            ${this.shoppingLists.map(
      (e) => l`
                <button
                  class=${this.selectedShoppingListId === e.id ? "selected" : ""}
                  @click=${() => this.selectShoppingList(e.id)}
                >
                  <span>${e.name}</span>
                  ${e.itemCount !== void 0 ? l`<small>${e.itemCount}</small>` : h}
                </button>
              `
    )}
          </div>
        </aside>

        <section class="grocery-main">
          ${this.selectedShoppingList ? l`
                <header>
                  <h3>${this.selectedShoppingList.name}</h3>
                  <button class="icon-button" title="Refresh list" @click=${() => this.selectedShoppingListId && this.loadShoppingList(this.selectedShoppingListId)}>
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </header>
                <div class="add-grocery">
                  <input
                    type="text"
                    placeholder="Add grocery item"
                    .value=${this.groceryText}
                    @input=${(e) => this.groceryText = f(e)}
                    @keydown=${this.onGroceryKeyDown}
                  />
                  <button class="primary" @click=${this.addShoppingItem} ?disabled=${!this.groceryText.trim()}>
                    <ha-icon icon="mdi:plus"></ha-icon>
                    <span>Add</span>
                  </button>
                </div>
                <div class="grocery-items">
                  ${this.groceryItemsForDisplay(this.selectedShoppingList).map((e) => this.renderShoppingItem(e))}
                </div>
              ` : l`<div class="empty-panel">Create or choose a grocery list.</div>`}
        </section>
      </section>
    `;
  }
  renderShoppingItem(e) {
    return l`
      <label class=${e.checked ? "grocery-item checked" : "grocery-item"}>
        <input
          type="checkbox"
          .checked=${e.checked}
          @change=${(t) => this.toggleShoppingItem(e, t.currentTarget.checked)}
        />
        <span>${e.title}</span>
        <button class="delete-inline" @click=${(t) => this.deleteShoppingItem(t, e)}>Remove</button>
      </label>
    `;
  }
  groceryItemsForDisplay(e) {
    return [
      ...e.items.filter((t) => !t.checked),
      ...e.items.filter((t) => t.checked)
    ];
  }
  renderAddDialog() {
    if (!this.addDialogOpen || !this.selectedSlot) return h;
    const e = this.filteredRecipes().slice(0, 36);
    return l`
      <dialog class="dialog add" @cancel=${this.closeAddDialog}>
        <form method="dialog" class="dialog-panel">
          <header>
            <div>
              <span>Add meal</span>
              <h3>${P(this.selectedSlot.entryType)} · ${this.formatDialogDate(this.selectedSlot.date)}</h3>
            </div>
            <button type="button" class="plain" @click=${this.closeAddDialog}>Close</button>
          </header>

          <div class="field-row">
            <label>
              Date
              <input type="date" .value=${this.selectedSlot.date} @input=${this.onDateInput} />
            </label>
            <label>
              Meal
              <select class="meal-type-select" .value=${this.selectedSlot.entryType} @change=${this.onEntryTypeInput}>
                ${this.renderEntryTypeOptions(this.selectedSlot.entryType)}
              </select>
            </label>
          </div>

          <label>
            Search recipes
            <input
              type="search"
              placeholder="Pasta, tacos, soup..."
              .value=${this.search}
              @input=${(t) => this.search = f(t)}
            />
          </label>

          <div class="recipe-results">
            ${e.map(
      (t) => l`
                ${this.renderMealOption(t)}
              `
    )}
          </div>

          <div class="note-area">
            <span>Or add a note</span>
            <div class="chips">
              ${rt.map(
      (t) => l`
                  <button type="button" @click=${() => this.chooseNote(t)}>
                    ${t}
                  </button>
                `
    )}
            </div>
            <div class="note-fields">
              <label>
                Title
                <input
                  type="text"
                  placeholder="Leftovers: Chicken dish"
                  .value=${this.noteTitle}
                  @input=${(t) => this.updateNoteTitle(f(t))}
                />
              </label>
              <label>
                Note
                <textarea
                  placeholder="Optional detail"
                  .value=${this.noteText}
                  @input=${(t) => this.updateNoteText(f(t))}
                ></textarea>
              </label>
            </div>
          </div>

          <footer>
            <button type="button" class="primary" @click=${this.addMeal} ?disabled=${!this.selectedRecipe && !this.noteTitle.trim()}>
              <ha-icon icon="mdi:calendar-plus"></ha-icon>
              <span>Add to plan</span>
            </button>
          </footer>
        </form>
      </dialog>
    `;
  }
  renderRecipeDialog() {
    if (!this.recipeDialogOpen || !this.selectedMeal && !this.selectedRecipeForDialog) return h;
    const e = this.recipeDetail, t = this.selectedMeal?.title ?? this.selectedRecipeForDialog?.name ?? "Recipe", i = this.selectedMeal?.entryType, a = !!(this.selectedMeal && !this.selectedMeal.recipeSlug && !this.selectedMeal.recipeId), r = e ?? this.selectedRecipeForDialog;
    return l`
      <dialog class="dialog recipe" @cancel=${this.closeRecipeDialog}>
        <article class="dialog-panel cook-panel">
          <header>
            <div>
              <span>${i ? P(i) : "Recipe"}</span>
              <h3>${t}</h3>
            </div>
            <button type="button" class="plain" @click=${this.closeRecipeDialog}>Close</button>
          </header>

          ${this.recipeLoading ? l`<div class="loading">Loading recipe...</div>` : l`
              ${this.selectedMeal ? this.renderMealPlacementEditor() : h}
              ${a ? this.renderNoteEditor() : l`
                ${e?.image || this.selectedMeal?.image ? l`<img class="hero-image" src=${e?.image ?? this.selectedMeal?.image ?? ""} alt="" />` : h}

                <div class="stats">
                  ${this.stat("Serves", e?.servings)}
                  ${this.stat("Prep", e?.prepTime)}
                  ${this.stat("Cook", e?.cookTime)}
                  ${this.stat("Total", e?.totalTime)}
                </div>

                ${e?.ingredients.length ? l`
                      <section class="cook-section">
                        <h4>Ingredients</h4>
                        <ul>
                          ${e.ingredients.map((s) => l`<li>${s}</li>`)}
                        </ul>
                      </section>
                    ` : this.selectedMeal?.text ? l`<section class="cook-section note"><p>${this.selectedMeal.text}</p></section>` : h}

                ${e?.instructions.length ? l`
                      <section class="cook-section">
                        <h4>Instructions</h4>
                        <ol>
                          ${e.instructions.map((s) => l`<li>${s}</li>`)}
                        </ol>
                      </section>
                    ` : h}

                ${e?.notes.length ? l`
                      <section class="cook-section">
                        <h4>Notes</h4>
                        <div class="recipe-notes">
                          ${e.notes.map(
      (s) => l`
                              <article>
                                ${s.title ? l`<strong>${s.title}</strong>` : h}
                                <p>${s.text}</p>
                              </article>
                            `
    )}
                        </div>
                      </section>
                    ` : h}
              `}
            `}

          <footer class="recipe-actions">
            ${a ? l`
                  <button class="primary" @click=${this.saveNoteMeal} ?disabled=${this.mealSaving || !this.noteEditTitle.trim()}>
                    <ha-icon class=${this.mealSaving ? "spin" : ""} icon=${this.mealSaving ? "mdi:loading" : "mdi:content-save-outline"}></ha-icon>
                    <span>${this.mealSaving ? "Saving" : "Save note"}</span>
                  </button>
                ` : h}
            ${this.selectedMeal && !a ? l`
                  <button class="primary" @click=${this.saveMealPlacement} ?disabled=${this.mealSaving || !this.mealPlacementChanged()}>
                    <ha-icon class=${this.mealSaving ? "spin" : ""} icon=${this.mealSaving ? "mdi:loading" : "mdi:content-save-outline"}></ha-icon>
                    <span>${this.mealSaving ? "Saving" : "Save changes"}</span>
                  </button>
                ` : h}
            ${!this.selectedMeal && !a && r ? l`
                  <button class="primary" @click=${this.planRecipeFromDialog} ?disabled=${!r.id}>
                    <ha-icon icon="mdi:calendar-plus"></ha-icon>
                    <span>Plan meal</span>
                  </button>
                ` : h}
            ${!a && e?.id && this.shoppingLists.length ? l`
                  <select .value=${this.selectedShoppingListId ?? ""} @change=${(s) => this.selectShoppingList(f(s))}>
                    ${this.shoppingLists.map((s) => l`<option .value=${s.id}>${s.name}</option>`)}
                  </select>
                  <button class="primary" @click=${() => e?.id && this.addRecipeToGroceries(e.id)}>
                    <ha-icon icon="mdi:cart-plus"></ha-icon>
                    <span>Add ingredients</span>
                  </button>
                ` : h}
            ${this.selectedMeal ? l`<button class="danger" @click=${() => this.selectedMeal && this.confirmDeleteMeal(this.selectedMeal)}>Remove meal</button>` : h}
          </footer>
        </article>
      </dialog>
    `;
  }
  renderNoteEditor() {
    return l`
      <section class="note-editor">
        <label>
          Title
          <input
            type="text"
            .value=${this.noteEditTitle}
            @input=${(e) => this.noteEditTitle = f(e)}
          />
        </label>
        <label>
          Note
          <textarea
            .value=${this.noteEditText}
            @input=${(e) => this.noteEditText = f(e)}
          ></textarea>
        </label>
      </section>
    `;
  }
  renderMealPlacementEditor() {
    return l`
      <section class="meal-placement-editor">
        <label>
          Date
          <input type="date" .value=${this.mealEditDate} @input=${this.onMealEditDateInput} />
        </label>
        <label>
          Meal
          <select class="meal-type-select" .value=${this.mealEditEntryType} @change=${this.onMealEditEntryTypeInput}>
            ${this.renderEntryTypeOptions(this.mealEditEntryType)}
          </select>
        </label>
      </section>
    `;
  }
  renderEntryTypeOptions(e) {
    const t = E(e);
    return this.entryTypes().map(
      (i) => l`<option value=${i} ?selected=${E(i) === t}>${P(i)}</option>`
    );
  }
  stat(e, t) {
    return t ? l`<div><span>${e}</span><strong>${t}</strong></div>` : h;
  }
  async refreshAll() {
    if (!(!this.hass || this.loading)) {
      this.loading = !0, this.error = void 0;
      try {
        await this.loadInfo(), await Promise.all([this.loadRecipes(), this.loadMealPlan(), this.loadShoppingLists()]);
      } catch (e) {
        this.error = $(e, "Could not load Mealie data through Home Assistant.");
      } finally {
        this.loading = !1;
      }
    }
  }
  async loadInfo() {
    const e = await this.callFamilyMealie("family_mealie/info"), t = v(e);
    this.imageToken = o(t?.image_token) ?? o(t?.imageToken);
  }
  async loadRecipes() {
    const e = await this.callFamilyMealie("family_mealie/recipes", {
      limit: this.config.result_limit ?? 300
    });
    this.recipes = _(e).map((t) => De(t, this.imageToken)).filter(Boolean);
  }
  async loadMealPlan() {
    const [e, t] = this.dateRange(), i = await this.callFamilyMealie("family_mealie/mealplans", {
      start_date: e,
      end_date: t,
      limit: -1
    });
    this.mealPlan = _(i).map((a) => ct(a, this.imageToken, this.entryTypes())).filter(Boolean);
  }
  async loadShoppingLists() {
    const e = await this.callFamilyMealie("family_mealie/shopping_lists", { limit: -1 }), t = _(e).map(ee).filter(Boolean);
    this.shoppingLists = t, !this.selectedShoppingListId && t.length && (this.selectedShoppingListId = t[0].id), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
  }
  async loadShoppingList(e) {
    const t = await this.callFamilyMealie("family_mealie/shopping_list", { list_id: e }), i = pt(t);
    i && (this.selectedShoppingList = i, this.selectedShoppingListId = i.id);
  }
  async fetchRecipeDetail(e) {
    const t = ot(e) ? e.recipeSlug : e.slug;
    if (!t) return;
    const i = await this.callFamilyMealie("family_mealie/recipe", { slug: t });
    return lt(i, this.imageToken);
  }
  async importRecipeUrl(e) {
    e.preventDefault();
    const t = this.recipeUrl.trim();
    if (t) {
      this.recipeSaving = !0, this.recipeMessage = void 0, this.error = void 0;
      try {
        await this.callFamilyMealie("family_mealie/recipes/import_url", {
          url: t,
          include_tags: !0,
          include_categories: !0,
          parse_ingredients: !0,
          ingredient_parser: this.config.ingredient_parser ?? "auto"
        }), this.recipeUrl = "", this.saveDraftNow(), this.recipeMessage = "Recipe imported.", await this.loadRecipes();
      } catch (i) {
        this.error = $(i, "Could not import recipe.");
      } finally {
        this.recipeSaving = !1;
      }
    }
  }
  async createManualRecipe(e) {
    e.preventDefault();
    const t = mt({
      name: this.manualRecipeName,
      source: this.manualRecipeSource,
      description: this.manualRecipeDescription,
      servings: this.manualRecipeServings,
      prep: this.manualRecipePrep,
      cook: this.manualRecipeCook,
      total: this.manualRecipeTotal,
      ingredients: this.manualRecipeIngredients,
      instructions: this.manualRecipeInstructions,
      notes: this.manualRecipeNotes,
      parseIngredients: this.manualParseIngredients,
      ingredientParser: this.config.ingredient_parser ?? "auto"
    });
    if (t.name) {
      this.recipeSaving = !0, this.recipeMessage = void 0, this.error = void 0;
      try {
        await this.callFamilyMealie("family_mealie/recipes/create", { payload: t }), this.clearManualRecipeForm(), this.saveDraftNow(), this.recipeMessage = "Recipe saved.", await this.loadRecipes();
      } catch (i) {
        this.error = $(i, "Could not save recipe.");
      } finally {
        this.recipeSaving = !1;
      }
    }
  }
  async addMeal(e) {
    if (e.preventDefault(), !this.selectedSlot) return;
    const t = this.selectedRecipe, i = this.noteTitle.trim(), a = this.noteText.trim(), r = {
      date: this.selectedSlot.date,
      entryType: this.canonicalEntryType(this.selectedSlot.entryType),
      title: "",
      text: ""
    };
    t?.id ? r.recipeId = t.id : i && (r.title = i, r.text = a);
    try {
      await this.callFamilyMealie("family_mealie/mealplans/create", { payload: r }), this.closeAddDialog(), this.selectedSlot = void 0, this.noteTitle = "", this.noteText = "", this.selectedRecipe = void 0, this.saveDraftNow(), await this.loadMealPlan();
    } catch (s) {
      this.error = $(s, "Could not add meal.");
    }
  }
  async saveNoteMeal(e) {
    e.preventDefault();
    const t = this.selectedMeal;
    if (!t?.id) return;
    const i = this.noteEditTitle.trim();
    if (!i) return;
    const a = this.noteEditText.trim(), r = $e(t, {
      date: this.mealEditDate || t.date,
      entryType: this.canonicalEntryType(this.mealEditEntryType || t.entryType),
      title: i,
      text: a
    });
    this.mealSaving = !0;
    try {
      await this.callFamilyMealie("family_mealie/mealplans/update", { meal_id: t.id, payload: r }), this.selectedMeal = {
        ...t,
        date: String(r.date ?? t.date),
        entryType: String(r.entryType ?? t.entryType),
        title: i,
        text: a,
        raw: { ...t.raw, ...r }
      }, await this.loadMealPlan(), this.closeRecipeDialog();
    } catch (s) {
      this.error = $(s, "Could not save meal.");
    } finally {
      this.mealSaving = !1;
    }
  }
  async saveMealPlacement(e) {
    e.preventDefault();
    const t = this.selectedMeal;
    t?.id && await this.moveMeal(t, this.mealEditDate || t.date, this.mealEditEntryType || t.entryType, !0);
  }
  async confirmDeleteMeal(e) {
    if (!(!e.id || !window.confirm(`Remove ${e.title} from ${this.formatDialogDate(e.date)}?`)))
      try {
        await this.callFamilyMealie("family_mealie/mealplans/delete", { meal_id: e.id }), this.closeRecipeDialog(), await this.loadMealPlan();
      } catch (i) {
        this.error = $(i, "Could not remove meal.");
      }
  }
  async createShoppingList(e) {
    e.preventDefault();
    const t = this.newListName.trim();
    if (t)
      try {
        const i = await this.callFamilyMealie("family_mealie/shopping_lists/create", { name: t }), a = ee(i);
        this.newListName = "", await this.loadShoppingLists(), a && await this.selectShoppingList(a.id);
      } catch (i) {
        this.error = $(i, "Could not create grocery list.");
      }
  }
  async addShoppingItem(e) {
    e?.preventDefault();
    const t = this.selectedShoppingList, i = this.groceryText.trim();
    if (!t || !i) return;
    const a = {
      shoppingListId: t.id,
      checked: !1,
      position: t.items.length,
      quantity: 1,
      note: i,
      display: i,
      extras: {},
      recipeReferences: []
    };
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/create", { payload: a }), this.groceryText = "", await this.loadShoppingList(t.id);
    } catch (r) {
      this.error = $(r, "Could not add grocery item.");
    }
  }
  async toggleShoppingItem(e, t) {
    const i = ut(e, t);
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/update", { item_id: e.id, payload: i }), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
    } catch (a) {
      this.error = $(a, "Could not update grocery item.");
    }
  }
  async deleteShoppingItem(e, t) {
    e.preventDefault(), e.stopPropagation();
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/delete", { item_id: t.id }), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
    } catch (i) {
      this.error = $(i, "Could not remove grocery item.");
    }
  }
  async addRecipeToGroceries(e) {
    if (this.selectedShoppingListId)
      try {
        await this.callFamilyMealie("family_mealie/shopping_lists/add_recipe", {
          list_id: this.selectedShoppingListId,
          recipe_id: e,
          scale: 1
        }), await this.loadShoppingList(this.selectedShoppingListId), this.view = "groceries", this.closeRecipeDialog();
      } catch (t) {
        this.error = $(t, "Could not add ingredients to grocery list.");
      }
  }
  async callFamilyMealie(e, t = {}) {
    if (!this.hass) throw new Error("Home Assistant is not ready yet.");
    return this.hass.callWS({
      type: e,
      entry_id: this.config.entry_id,
      ...t
    });
  }
  openView(e) {
    this.view = e, e === "groceries" && !this.selectedShoppingList && this.selectedShoppingListId && this.loadShoppingList(this.selectedShoppingListId);
  }
  async shiftPlannerRange(e) {
    this.plannerOffsetDays += e, await this.reloadPlannerRange();
  }
  async reloadPlannerRange() {
    if (this.hass) {
      this.error = void 0;
      try {
        await this.loadMealPlan();
      } catch (e) {
        this.error = $(e, "Could not load meals for this week.");
      }
    }
  }
  clearManualRecipeForm() {
    this.manualRecipeName = "", this.manualRecipeSource = "", this.manualRecipeDescription = "", this.manualRecipeServings = "", this.manualRecipePrep = "", this.manualRecipeCook = "", this.manualRecipeTotal = "", this.manualRecipeIngredients = "", this.manualRecipeInstructions = "", this.manualRecipeNotes = "", this.manualParseIngredients = !0;
  }
  setRecipeCreateMode(e) {
    this.recipeCreateMode = e;
  }
  setSearch(e) {
    this.search = e;
  }
  openAddDialog(e, t) {
    this.selectedSlot = e, this.selectedRecipe = t, this.search = t?.name ?? "", this.noteTitle = "", this.noteText = "", this.addDialogOpen = !0;
  }
  defaultRecipePlanSlot() {
    const [e, t] = this.dateRange(), i = M(K(/* @__PURE__ */ new Date())), a = this.entryTypes()[0] ?? L[0];
    return {
      date: i >= e && i <= t ? i : e,
      entryType: a
    };
  }
  async openMealDialog(e) {
    if (this.selectedMeal = e, this.selectedRecipeForDialog = void 0, this.recipeDetail = void 0, this.mealEditDate = e.date, this.mealEditEntryType = e.entryType, this.noteEditTitle = e.title, this.noteEditText = e.text ?? "", this.recipeDialogOpen = !0, e.recipeSlug) {
      this.recipeLoading = !0;
      try {
        this.recipeDetail = await this.fetchRecipeDetail(e);
      } catch (t) {
        this.error = $(t, "Could not load recipe details.");
      } finally {
        this.recipeLoading = !1;
      }
    }
  }
  async openRecipeSummaryDialog(e) {
    this.selectedMeal = void 0, this.selectedRecipeForDialog = e, this.recipeDetail = void 0, this.recipeDialogOpen = !0, this.recipeLoading = !0;
    try {
      this.recipeDetail = await this.fetchRecipeDetail(e);
    } catch (t) {
      this.error = $(t, "Could not load recipe details.");
    } finally {
      this.recipeLoading = !1;
    }
  }
  async selectShoppingList(e) {
    e && (this.selectedShoppingListId = e, await this.loadShoppingList(e));
  }
  chooseRecipe(e) {
    this.selectedRecipe = e, this.noteTitle = "", this.noteText = "";
  }
  chooseNote(e) {
    this.noteTitle = e, this.selectedRecipe = void 0;
  }
  updateNoteTitle(e) {
    this.noteTitle = e, e && (this.selectedRecipe = void 0);
  }
  updateNoteText(e) {
    this.noteText = e, e && (this.selectedRecipe = void 0);
  }
  onDateInput(e) {
    this.selectedSlot && (this.selectedSlot = { ...this.selectedSlot, date: f(e) });
  }
  onEntryTypeInput(e) {
    this.selectedSlot && (this.selectedSlot = { ...this.selectedSlot, entryType: this.canonicalEntryType(f(e)) });
  }
  mealPlacementChanged() {
    const e = this.selectedMeal;
    return e ? this.mealEditDate !== e.date || this.canonicalEntryType(this.mealEditEntryType) !== this.canonicalEntryType(e.entryType) : !1;
  }
  startMealPointer(e, t) {
    if (!t.id || e.button !== 0) return;
    const i = e.currentTarget;
    i.setPointerCapture?.(e.pointerId);
    const a = {
      mealId: String(t.id),
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      active: !1,
      source: i,
      holdTimer: void 0
    };
    a.holdTimer = window.setTimeout(() => this.activateMealPointerDrag(a.pointerId), 450), this.pointerDrag = a;
  }
  activateMealPointerDrag(e) {
    const t = this.pointerDrag;
    !t || t.pointerId !== e || (t.active = !0, t.holdTimer = void 0, this.draggingMealId = t.mealId, this.classList.add("dragging-meal"), t.source.classList.add("dragging"));
  }
  onMealCardClick(e, t) {
    if (Date.now() < this.suppressMealClickUntil) {
      e.preventDefault(), e.stopPropagation();
      return;
    }
    this.openMealDialog(t);
  }
  async dropMeal(e, t, i) {
    if (!this.draggingMealId) return;
    e.preventDefault(), e.stopPropagation();
    const a = e.dataTransfer?.getData("text/plain") || this.draggingMealId, r = this.mealPlan.find((s) => String(s.id) === a);
    this.clearDraggingState(), r && await this.moveMeal(r, t, i ?? r.entryType);
  }
  dropTargetFromPoint(e, t) {
    const r = this.renderRoot.elementFromPoint?.(e, t)?.closest("[data-drop-date]"), s = r?.dataset.dropDate;
    if (s)
      return {
        date: s,
        entryType: r.dataset.dropEntryType
      };
  }
  clearDraggingState() {
    this.classList.remove("dragging-meal"), this.renderRoot.querySelectorAll(".meal-pill.dragging").forEach((e) => e.classList.remove("dragging")), this.draggingMealId = void 0;
  }
  async moveMeal(e, t, i, a = !1) {
    const r = this.canonicalEntryType(i);
    if (!e.id || !t || !r || e.date === t && this.canonicalEntryType(e.entryType) === r) return;
    const s = $e(e, { date: t, entryType: r });
    this.mealSaving = !0;
    try {
      await this.callFamilyMealie("family_mealie/mealplans/update", { meal_id: e.id, payload: s }), this.selectedMeal = this.selectedMeal?.id === e.id ? { ...e, date: t, entryType: r, raw: { ...e.raw, ...s } } : this.selectedMeal, await this.loadMealPlan(), a && this.closeRecipeDialog();
    } catch (n) {
      this.error = $(n, "Could not move meal.");
    } finally {
      this.mealSaving = !1;
    }
  }
  filteredRecipes() {
    const e = this.search.trim().toLocaleLowerCase();
    return e ? this.recipes.filter((t) => t.name.toLocaleLowerCase().includes(e)) : this.recipes;
  }
  selectedRecipeKey(e) {
    return e?.id ?? e?.slug ?? e?.name;
  }
  mealsFor(e, t) {
    const i = E(t);
    return this.mealPlan.filter((a) => a.date === e && E(a.entryType) === i);
  }
  hasMealsForDay(e) {
    return this.mealPlan.some((t) => t.date === e);
  }
  daysToShow() {
    const e = Math.max(1, Math.min(14, this.config.days ?? 7)), t = K(/* @__PURE__ */ new Date()), i = te(wt(t, this.weekStartIndex()), this.plannerOffsetDays);
    return Array.from({ length: e }, (a, r) => te(i, r));
  }
  rangeStepDays() {
    return Math.max(1, Math.min(14, this.config.days ?? 7));
  }
  entryTypes() {
    const e = this.config.entry_types?.map((t) => t.trim()).filter(Boolean) ?? [];
    return e.length ? e : L;
  }
  canonicalEntryType(e) {
    return Me(e, this.entryTypes());
  }
  weekStartIndex() {
    return _t(this.config.week_start);
  }
  dateRange() {
    const e = this.daysToShow();
    return [M(e[0]), M(e[e.length - 1])];
  }
  subtitle() {
    if (this.view === "recipes") return `${this.recipes.length} recipes`;
    if (this.view === "groceries") return this.selectedShoppingList?.name ?? "Grocery lists";
    const e = this.daysToShow();
    return `${this.formatMonthDay(e[0])} - ${this.formatMonthDay(e[e.length - 1])}`;
  }
  formatWeekday(e) {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { weekday: "short" }).format(e);
  }
  formatMonthDay(e) {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { month: "short", day: "numeric" }).format(e);
  }
  formatDialogDate(e) {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { weekday: "long", month: "long", day: "numeric" }).format(St(e));
  }
  restartRefreshTimer() {
    window.clearInterval(this.refreshTimer);
    const e = this.config.refresh_minutes ?? 15;
    e > 0 && (this.refreshTimer = window.setInterval(() => void this.refreshAll(), e * 60 * 1e3));
  }
  syncNativeDialogs() {
    const e = this.renderRoot.querySelector("dialog.add"), t = this.renderRoot.querySelector("dialog.recipe");
    this.addDialogOpen && e && !e.open && e.showModal(), this.recipeDialogOpen && t && !t.open && t.showModal();
  }
  syncNativeSelects() {
    const e = this.renderRoot.querySelector("dialog.add select.meal-type-select");
    e && this.selectedSlot && (e.value = this.canonicalEntryType(this.selectedSlot.entryType));
    const t = this.renderRoot.querySelector("dialog.recipe select.meal-type-select");
    t && this.selectedMeal && (t.value = this.canonicalEntryType(this.mealEditEntryType || this.selectedMeal.entryType));
  }
  restoreDraft() {
    if (this.draftRestored) return;
    this.draftRestored = !0;
    const e = $t(this.draftStorageKey());
    e && (e.view && ["planner", "recipes", "groceries"].includes(e.view) && (this.view = e.view), typeof e.plannerOffsetDays == "number" && (this.plannerOffsetDays = e.plannerOffsetDays), typeof e.search == "string" && (this.search = e.search), typeof e.recipeCreateOpen == "boolean" && (this.recipeCreateOpen = e.recipeCreateOpen), (e.recipeCreateMode === "url" || e.recipeCreateMode === "manual") && (this.recipeCreateMode = e.recipeCreateMode), typeof e.recipeUrl == "string" && (this.recipeUrl = e.recipeUrl), typeof e.manualRecipeName == "string" && (this.manualRecipeName = e.manualRecipeName), typeof e.manualRecipeSource == "string" && (this.manualRecipeSource = e.manualRecipeSource), typeof e.manualRecipeDescription == "string" && (this.manualRecipeDescription = e.manualRecipeDescription), typeof e.manualRecipeServings == "string" && (this.manualRecipeServings = e.manualRecipeServings), typeof e.manualRecipePrep == "string" && (this.manualRecipePrep = e.manualRecipePrep), typeof e.manualRecipeCook == "string" && (this.manualRecipeCook = e.manualRecipeCook), typeof e.manualRecipeTotal == "string" && (this.manualRecipeTotal = e.manualRecipeTotal), typeof e.manualRecipeIngredients == "string" && (this.manualRecipeIngredients = e.manualRecipeIngredients), typeof e.manualRecipeInstructions == "string" && (this.manualRecipeInstructions = e.manualRecipeInstructions), typeof e.manualRecipeNotes == "string" && (this.manualRecipeNotes = e.manualRecipeNotes), typeof e.manualParseIngredients == "boolean" && (this.manualParseIngredients = e.manualParseIngredients), e.selectedSlot?.date && e.selectedSlot.entryType && (this.selectedSlot = {
      date: e.selectedSlot.date,
      entryType: this.canonicalEntryType(e.selectedSlot.entryType)
    }), typeof e.noteTitle == "string" && (this.noteTitle = e.noteTitle), typeof e.noteText == "string" && (this.noteText = e.noteText), e.addDialogOpen && this.selectedSlot && (this.addDialogOpen = !0));
  }
  scheduleDraftSave() {
    window.clearTimeout(this.draftSaveTimer), this.draftSaveTimer = window.setTimeout(() => this.saveDraftNow(), 150);
  }
  saveDraftNow() {
    window.clearTimeout(this.draftSaveTimer), bt(this.draftStorageKey(), {
      view: this.view,
      plannerOffsetDays: this.plannerOffsetDays,
      search: this.search,
      recipeCreateOpen: this.recipeCreateOpen,
      recipeCreateMode: this.recipeCreateMode,
      recipeUrl: this.recipeUrl,
      manualRecipeName: this.manualRecipeName,
      manualRecipeSource: this.manualRecipeSource,
      manualRecipeDescription: this.manualRecipeDescription,
      manualRecipeServings: this.manualRecipeServings,
      manualRecipePrep: this.manualRecipePrep,
      manualRecipeCook: this.manualRecipeCook,
      manualRecipeTotal: this.manualRecipeTotal,
      manualRecipeIngredients: this.manualRecipeIngredients,
      manualRecipeInstructions: this.manualRecipeInstructions,
      manualRecipeNotes: this.manualRecipeNotes,
      manualParseIngredients: this.manualParseIngredients,
      addDialogOpen: this.addDialogOpen,
      selectedSlot: this.selectedSlot,
      noteTitle: this.noteTitle,
      noteText: this.noteText
    });
  }
  draftStorageKey() {
    return `${st}:${this.config.entry_id ?? this.config.title ?? "default"}`;
  }
};
c.styles = Ie`
    :host {
      display: block;
      color: var(--primary-text-color);
      container-type: inline-size;
      --family-accent: var(--primary-color, #4f7765);
      --family-accent-soft: color-mix(in srgb, var(--family-accent) 12%, var(--card-background-color, #fff));
      --family-warm: color-mix(in srgb, #e8bc7c 12%, var(--card-background-color, #fff));
      --meal-card-radius: 14px;
      --meal-card-touch: 52px;
      --meal-card-surface: var(--card-background-color, #fff);
      --meal-card-muted: var(--secondary-text-color, #6b7280);
      --meal-card-line: var(--divider-color, rgba(0, 0, 0, 0.12));
      --meal-card-accent: var(--family-accent);
      --meal-card-warning: var(--error-color, #b3261e);
    }

    ha-card {
      overflow: hidden;
      border-radius: 26px;
      background: var(--meal-card-surface);
    }

    .shell {
      padding: 20px;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--meal-card-accent) 10%, transparent), transparent 220px),
        var(--meal-card-surface);
    }

    .topbar,
    .dialog-panel > header,
    .dialog-panel > footer,
    .grocery-main header,
    .rail-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .topbar {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr) auto;
      align-items: center;
      margin: -20px -20px 0;
      padding: 22px 24px;
      border-bottom: 1px solid var(--meal-card-line);
      background: linear-gradient(120deg, var(--family-accent-soft), color-mix(in srgb, #e8bc7c 10%, var(--meal-card-surface)));
    }

    .hero-icon {
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 16px;
      color: var(--family-accent);
      background: color-mix(in srgb, var(--family-accent) 15%, transparent);
    }

    .hero-icon ha-icon {
      --mdc-icon-size: 30px;
    }

    .hero-copy {
      min-width: 0;
    }

    .eyebrow {
      margin: 0 0 3px;
      color: var(--family-accent);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.13em;
      text-transform: uppercase;
    }

    h2,
    h3,
    h4,
    p {
      margin: 0;
    }

    h2 {
      font-size: 28px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }

    h3 {
      font-size: 24px;
      line-height: 1.15;
    }

    .topbar p,
    header span,
    .stats span,
    .note-area span {
      color: var(--meal-card-muted);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .topbar .eyebrow {
      color: var(--family-accent);
      font-size: 11px;
      letter-spacing: 0.13em;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    button {
      min-height: var(--meal-card-touch);
      border: 1px solid var(--meal-card-line);
      border-radius: 13px;
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      cursor: pointer;
    }

    button:disabled {
      cursor: progress;
      opacity: 0.65;
    }

    .primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border-color: transparent;
      background: var(--meal-card-accent);
      color: var(--text-primary-color, #fff);
      font-weight: 800;
      padding: 0 18px;
      box-shadow: 0 7px 18px color-mix(in srgb, var(--meal-card-accent) 24%, transparent);
    }

    .primary:disabled {
      box-shadow: none;
    }

    .secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border-color: color-mix(in srgb, var(--meal-card-accent) 30%, var(--meal-card-line));
      background: var(--family-accent-soft);
      color: var(--meal-card-accent);
      font-weight: 800;
      padding: 0 18px;
    }

    .icon-button {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      min-height: 44px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: var(--secondary-background-color);
      cursor: pointer;
    }

    .primary ha-icon,
    .secondary ha-icon,
    .icon-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .action {
      min-width: 116px;
    }

    .plain {
      min-height: 44px;
      padding: 0 14px;
      background: transparent;
    }

    .small {
      min-height: 40px;
      padding: 0 12px;
      font-size: 14px;
      font-weight: 750;
    }

    .danger,
    .delete-inline {
      color: var(--meal-card-warning);
      border-color: color-mix(in srgb, var(--meal-card-warning) 32%, var(--meal-card-line));
      background: color-mix(in srgb, var(--meal-card-warning) 8%, var(--meal-card-surface));
      font-weight: 750;
    }

    .tabs {
      display: inline-grid;
      grid-template-columns: repeat(3, minmax(120px, 1fr));
      gap: 6px;
      margin-top: 18px;
      padding: 6px;
      border: 1px solid var(--meal-card-line);
      border-radius: 16px;
      background: color-mix(in srgb, var(--primary-background-color, #f6f6f6) 72%, var(--meal-card-surface));
    }

    .tabs button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-height: 44px;
      border-radius: 12px;
      border: 0;
      font-weight: 800;
      background: transparent;
    }

    .tabs ha-icon {
      color: var(--meal-card-accent);
      --mdc-icon-size: 20px;
    }

    .tabs button.active {
      background: var(--meal-card-surface);
      box-shadow: var(--ha-card-box-shadow, 0 1px 4px rgba(0, 0, 0, 0.16));
    }

    .notice {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px 14px;
      border-radius: var(--meal-card-radius);
      font-size: 13px;
    }

    .notice.error {
      border: 1px solid color-mix(in srgb, var(--meal-card-warning) 35%, transparent);
      background: color-mix(in srgb, var(--meal-card-warning) 9%, var(--meal-card-surface));
      color: var(--meal-card-warning);
    }

    .board {
      display: grid;
      grid-template-columns: repeat(var(--day-count), minmax(178px, 1fr));
      gap: 12px;
      overflow-x: auto;
      padding: 18px 2px 2px;
      scrollbar-width: thin;
    }

    .day {
      min-width: 178px;
      border: 1px solid var(--meal-card-line);
      border-radius: 18px;
      background: color-mix(in srgb, var(--meal-card-surface) 90%, var(--primary-background-color, #f6f6f6));
      overflow: hidden;
    }

    .day-head {
      padding: 14px;
      border-bottom: 1px solid var(--meal-card-line);
    }

    .day-head span,
    .day-head strong {
      display: block;
    }

    .day-head span {
      color: var(--meal-card-muted);
      font-weight: 750;
    }

    .day-head strong {
      margin-top: 4px;
      font-size: 22px;
    }

    .meal-sections {
      display: grid;
      gap: 0;
      padding: 6px 0;
    }

    .drop-targets {
      display: none;
      grid-template-columns: repeat(auto-fit, minmax(86px, 1fr));
      gap: 8px;
      padding: 10px 12px 4px;
    }

    :host(.dragging-meal) .drop-targets {
      display: grid;
    }

    .drop-targets button {
      min-height: 40px;
      border-style: dashed;
      color: var(--meal-card-accent);
      background: color-mix(in srgb, var(--meal-card-accent) 8%, var(--meal-card-surface));
      font-size: 13px;
      font-weight: 800;
    }

    .planner-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
    }

    .empty-day {
      min-height: 150px;
      display: grid;
      place-items: center;
      padding: 18px;
      color: var(--meal-card-muted);
      font-weight: 800;
      text-align: center;
    }

    .meal-section {
      display: grid;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid var(--meal-card-line);
    }

    .meal-section:first-child {
      border-top: 0;
    }

    .meal-section header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .meal-section header span {
      color: var(--meal-card-muted);
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .meal-list {
      display: grid;
      gap: 8px;
    }

    .meal-pill {
      display: block;
      width: 100%;
      min-height: 64px;
      padding: 12px;
      border: 1px solid var(--meal-card-line);
      border-radius: 12px;
      background: var(--meal-card-surface);
      text-align: left;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
      touch-action: none;
      user-select: none;
    }

    .meal-pill strong,
    .meal-pill small {
      display: block;
      overflow-wrap: anywhere;
    }

    .meal-pill strong {
      font-size: 17px;
      line-height: 1.2;
    }

    .meal-pill small {
      margin-top: 4px;
      color: var(--meal-card-muted);
      font-size: 13px;
    }

    .meal-pill.dragging {
      opacity: 0.45;
      outline: 2px solid color-mix(in srgb, var(--meal-card-accent) 45%, transparent);
    }

    .recipe-create-panel,
    .recipe-toolbar {
      margin-top: 18px;
    }

    .recipe-toolbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: end;
    }

    .recipe-create-panel {
      display: grid;
      gap: 14px;
      padding: 14px;
      border: 1px solid var(--meal-card-line);
      border-radius: 18px;
      background: color-mix(in srgb, var(--meal-card-surface) 94%, var(--primary-background-color, #f6f6f6));
    }

    .recipe-create-panel header,
    .manual-recipe-form footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .mode-tabs {
      display: inline-flex;
      gap: 6px;
      padding: 5px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: var(--meal-card-surface);
    }

    .mode-tabs button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 40px;
      border: 0;
      padding: 0 12px;
      background: transparent;
      font-weight: 800;
    }

    .mode-tabs ha-icon {
      --mdc-icon-size: 18px;
    }

    .mode-tabs button.active {
      background: color-mix(in srgb, var(--meal-card-accent) 12%, var(--meal-card-surface));
      color: var(--meal-card-accent);
    }

    .recipe-url-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      align-items: end;
    }

    .manual-recipe-form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .span-2 {
      grid-column: 1 / -1;
    }

    .time-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    .success {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border: 1px solid color-mix(in srgb, var(--meal-card-accent) 35%, transparent);
      border-radius: var(--meal-card-radius);
      color: var(--meal-card-accent);
      background: color-mix(in srgb, var(--meal-card-accent) 8%, var(--meal-card-surface));
      font-weight: 750;
    }

    .success.compact {
      margin-top: 12px;
    }

    .check-row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
    }

    .check-row input {
      width: 24px;
      height: 24px;
      min-height: auto;
      padding: 0;
    }

    .recipe-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 14px;
    }

    .recipe-tile {
      display: grid;
      grid-template-rows: 128px auto;
      gap: 10px;
      min-height: 210px;
      padding: 10px;
      border-radius: 16px;
      text-align: left;
      font-weight: 800;
    }

    .recipe-tile img,
    .hero-image {
      width: 100%;
      object-fit: cover;
      border-radius: var(--meal-card-radius);
      background: var(--primary-background-color);
    }

    .recipe-tile img {
      height: 128px;
    }

    .recipe-tile span {
      overflow-wrap: anywhere;
    }

    .grocery-layout {
      display: grid;
      grid-template-columns: minmax(220px, 280px) 1fr;
      gap: 14px;
      margin-top: 18px;
    }

    .list-rail,
    .grocery-main,
    .empty-panel {
      border: 1px solid var(--meal-card-line);
      border-radius: 18px;
      background: color-mix(in srgb, var(--meal-card-surface) 92%, var(--primary-background-color, #f6f6f6));
    }

    .list-rail {
      display: grid;
      align-content: start;
      gap: 10px;
      padding: 12px;
    }

    .list-buttons {
      display: grid;
      gap: 8px;
    }

    .list-buttons button {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 48px;
      padding: 0 12px;
      text-align: left;
      font-weight: 800;
    }

    .list-buttons button.selected {
      border-color: var(--meal-card-accent);
      background: color-mix(in srgb, var(--meal-card-accent) 10%, var(--meal-card-surface));
    }

    .list-buttons small {
      color: var(--meal-card-muted);
    }

    .grocery-main {
      display: grid;
      gap: 12px;
      padding: 14px;
      align-content: start;
    }

    .add-grocery {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
    }

    .grocery-items {
      display: grid;
      gap: 8px;
    }

    .grocery-item {
      display: grid;
      grid-template-columns: 32px 1fr auto;
      align-items: center;
      gap: 10px;
      min-height: 58px;
      padding: 8px 10px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      font-size: 18px;
      font-weight: 750;
    }

    .grocery-item.checked {
      opacity: 0.72;
      background: color-mix(in srgb, var(--meal-card-surface) 88%, var(--primary-background-color, #f6f6f6));
    }

    .grocery-item input {
      min-height: auto;
      width: 24px;
      height: 24px;
      padding: 0;
    }

    .grocery-item input:checked + span {
      color: var(--meal-card-muted);
      text-decoration: line-through;
    }

    .delete-inline {
      min-height: 38px;
      padding: 0 10px;
      font-size: 13px;
    }

    .empty-panel {
      min-height: 240px;
      display: grid;
      place-items: center;
      color: var(--meal-card-muted);
      font-weight: 800;
    }

    .dialog {
      width: min(980px, calc(100vw - 32px));
      max-height: min(860px, calc(100vh - 32px));
      border: 0;
      border-radius: 22px;
      padding: 0;
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      box-shadow: var(--ha-card-box-shadow, 0 18px 64px rgba(0, 0, 0, 0.32));
    }

    .dialog::backdrop {
      background: rgba(0, 0, 0, 0.42);
    }

    .dialog-panel {
      display: grid;
      gap: 18px;
      padding: 22px;
      max-height: calc(100vh - 76px);
      overflow: auto;
    }

    .dialog-panel h3 {
      margin-top: 4px;
      font-size: 28px;
      line-height: 1.12;
    }

    .field-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    label {
      display: grid;
      gap: 8px;
      color: var(--meal-card-muted);
      font-weight: 750;
    }

    input,
    select,
    textarea {
      min-height: var(--meal-card-touch);
      border: 1px solid var(--meal-card-line);
      border-radius: 12px;
      padding: 0 14px;
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      outline: none;
    }

    input:focus,
    select:focus,
    textarea:focus {
      border-color: var(--meal-card-accent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--meal-card-accent) 14%, transparent);
    }

    textarea {
      min-height: 130px;
      padding-top: 12px;
      resize: vertical;
    }

    textarea.tall {
      min-height: 190px;
    }

    .recipe-results {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 10px;
      max-height: 320px;
      overflow: auto;
      padding-right: 4px;
    }

    .recipe-results button {
      display: grid;
      grid-template-columns: 48px 1fr;
      align-items: center;
      gap: 12px;
      min-height: 68px;
      padding: 9px;
      text-align: left;
      font-weight: 750;
    }

    .recipe-results button.selected {
      border-color: var(--meal-card-accent);
      background: color-mix(in srgb, var(--meal-card-accent) 10%, var(--meal-card-surface));
    }

    .recipe-results img,
    .thumb {
      width: 48px;
      height: 48px;
      border-radius: var(--meal-card-radius);
      object-fit: cover;
    }

    .thumb {
      display: grid;
      place-items: center;
      background: color-mix(in srgb, var(--meal-card-accent) 16%, var(--meal-card-surface));
      color: var(--meal-card-accent);
      font-weight: 900;
    }

    .recipe-tile .thumb {
      width: 100%;
      height: 128px;
      font-size: 44px;
    }

    .note-area {
      display: grid;
      gap: 10px;
    }

    .note-fields {
      display: grid;
      grid-template-columns: minmax(180px, 0.85fr) minmax(220px, 1.15fr);
      gap: 12px;
    }

    .note-fields textarea {
      min-height: 84px;
    }

    .note-editor {
      display: grid;
      gap: 14px;
    }

    .meal-placement-editor {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      padding: 12px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: color-mix(in srgb, var(--meal-card-surface) 94%, var(--primary-background-color, #f6f6f6));
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .chips button {
      min-height: 44px;
      padding: 0 14px;
      font-weight: 750;
    }

    .hero-image {
      max-height: 300px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .stats div {
      padding: 14px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
    }

    .stats strong {
      display: block;
      margin-top: 6px;
      font-size: 20px;
    }

    .cook-section {
      display: grid;
      gap: 12px;
    }

    .cook-section h4 {
      font-size: 22px;
    }

    .cook-section ul,
    .cook-section ol {
      margin: 0;
      padding-left: 28px;
      font-size: 20px;
      line-height: 1.55;
    }

    .cook-section li + li {
      margin-top: 10px;
    }

    .recipe-notes {
      display: grid;
      gap: 10px;
    }

    .recipe-notes article {
      display: grid;
      gap: 6px;
      padding: 12px 14px;
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: color-mix(in srgb, var(--meal-card-surface) 92%, var(--primary-background-color, #f6f6f6));
    }

    .recipe-notes p {
      font-size: 18px;
      line-height: 1.45;
    }

    .recipe-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .recipe-actions select {
      min-width: 220px;
    }

    .loading {
      min-height: 180px;
      display: grid;
      place-items: center;
      color: var(--meal-card-muted);
      font-size: 20px;
    }

    @media (max-width: 860px) {
      .shell {
        padding: 14px;
      }

      .topbar {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: flex-start;
        margin: -14px -14px 0;
        padding: 18px;
      }

      .hero-icon {
        display: none;
      }

      .top-actions {
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .add-button {
        min-width: 44px;
        width: 44px;
        padding: 0;
      }

      .add-button span {
        display: none;
      }

      .tabs {
        width: 100%;
        grid-template-columns: repeat(3, 1fr);
      }

      .board {
        grid-template-columns: repeat(var(--day-count), minmax(220px, 82vw));
      }

      .field-row,
      .manual-recipe-form,
      .note-fields,
      .recipe-toolbar,
      .recipe-url-row,
      .stats,
      .grocery-layout {
        grid-template-columns: 1fr;
      }

      .time-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;
p([
  Te({ attribute: !1 })
], c.prototype, "hass", 2);
p([
  d()
], c.prototype, "config", 2);
p([
  d()
], c.prototype, "view", 2);
p([
  d()
], c.prototype, "recipes", 2);
p([
  d()
], c.prototype, "mealPlan", 2);
p([
  d()
], c.prototype, "shoppingLists", 2);
p([
  d()
], c.prototype, "selectedShoppingList", 2);
p([
  d()
], c.prototype, "selectedShoppingListId", 2);
p([
  d()
], c.prototype, "imageToken", 2);
p([
  d()
], c.prototype, "loading", 2);
p([
  d()
], c.prototype, "error", 2);
p([
  d()
], c.prototype, "addDialogOpen", 2);
p([
  d()
], c.prototype, "recipeDialogOpen", 2);
p([
  d()
], c.prototype, "selectedSlot", 2);
p([
  d()
], c.prototype, "selectedMeal", 2);
p([
  d()
], c.prototype, "mealEditDate", 2);
p([
  d()
], c.prototype, "mealEditEntryType", 2);
p([
  d()
], c.prototype, "mealSaving", 2);
p([
  d()
], c.prototype, "selectedRecipeForDialog", 2);
p([
  d()
], c.prototype, "recipeDetail", 2);
p([
  d()
], c.prototype, "recipeLoading", 2);
p([
  d()
], c.prototype, "search", 2);
p([
  d()
], c.prototype, "noteTitle", 2);
p([
  d()
], c.prototype, "noteText", 2);
p([
  d()
], c.prototype, "noteEditTitle", 2);
p([
  d()
], c.prototype, "noteEditText", 2);
p([
  d()
], c.prototype, "selectedRecipe", 2);
p([
  d()
], c.prototype, "plannerOffsetDays", 2);
p([
  d()
], c.prototype, "recipeCreateOpen", 2);
p([
  d()
], c.prototype, "recipeCreateMode", 2);
p([
  d()
], c.prototype, "recipeUrl", 2);
p([
  d()
], c.prototype, "manualRecipeName", 2);
p([
  d()
], c.prototype, "manualRecipeSource", 2);
p([
  d()
], c.prototype, "manualRecipeDescription", 2);
p([
  d()
], c.prototype, "manualRecipeServings", 2);
p([
  d()
], c.prototype, "manualRecipePrep", 2);
p([
  d()
], c.prototype, "manualRecipeCook", 2);
p([
  d()
], c.prototype, "manualRecipeTotal", 2);
p([
  d()
], c.prototype, "manualRecipeIngredients", 2);
p([
  d()
], c.prototype, "manualRecipeInstructions", 2);
p([
  d()
], c.prototype, "manualRecipeNotes", 2);
p([
  d()
], c.prototype, "manualParseIngredients", 2);
p([
  d()
], c.prototype, "recipeSaving", 2);
p([
  d()
], c.prototype, "recipeMessage", 2);
p([
  d()
], c.prototype, "groceryText", 2);
p([
  d()
], c.prototype, "newListName", 2);
c = p([
  Qe("family-mealie-planner-card")
], c);
function De(e, t) {
  const i = v(e);
  if (!i) return;
  const a = o(i.name) ?? o(i.recipe_name) ?? o(i.title);
  if (!a) return;
  const r = o(i.slug) ?? o(i.recipe_slug), s = o(i.id) ?? o(i.recipe_id);
  return {
    id: s,
    slug: r,
    name: a,
    description: o(i.description),
    image: ke(s, i, t),
    raw: i
  };
}
function ot(e) {
  return "entryType" in e;
}
function lt(e, t) {
  const i = v(e), a = De(i, t);
  if (!(!i || !a))
    return {
      ...a,
      servings: ft(
        i.recipe_servings ?? i.recipeServings ?? i.servings,
        i.recipe_yield ?? i.recipeYield
      ),
      prepTime: Q(i.prep_time ?? i.prepTime),
      cookTime: Q(i.cook_time ?? i.cookTime),
      totalTime: Q(i.total_time ?? i.totalTime),
      ingredients: yt(i.recipe_ingredient ?? i.ingredients ?? i.recipeIngredient),
      instructions: vt(i.recipe_instructions ?? i.instructions ?? i.recipeInstructions),
      notes: xt(i.notes ?? i.recipe_notes ?? i.recipeNotes)
    };
}
function ct(e, t, i = L) {
  const a = v(e);
  if (!a) return;
  const r = v(a.recipe), s = o(a.date) ?? o(a.mealplan_date) ?? o(a.mealplanDate), n = Me(
    o(a.entryType) ?? o(a.entry_type) ?? o(a.mealType) ?? o(a.meal_type) ?? "",
    i
  ), m = o(a.text) ?? o(a.note), u = o(a.title) || o(r?.name) || m || "Meal", y = o(a.recipeSlug) ?? o(a.recipe_slug) ?? o(r?.slug);
  if (!(!s || !n))
    return {
      id: a.id,
      date: s.slice(0, 10),
      entryType: n,
      title: u,
      text: m,
      recipeId: o(a.recipeId) ?? o(a.recipe_id) ?? o(r?.id),
      recipeSlug: y,
      image: ke(o(a.recipeId) ?? o(a.recipe_id) ?? o(r?.id), r, t),
      raw: a
    };
}
function ee(e) {
  const t = v(e);
  if (!t) return;
  const i = o(t.id);
  if (!i) return;
  const a = o(t.name) ?? "Grocery List", r = _(t.listItems ?? t.list_items);
  return {
    id: i,
    name: a,
    itemCount: r.length || void 0,
    raw: t
  };
}
function pt(e) {
  const t = ee(e), i = v(e);
  if (!(!t || !i))
    return {
      ...t,
      items: _(i.listItems ?? i.list_items).map(dt).filter(Boolean)
    };
}
function dt(e) {
  const t = v(e);
  if (!t) return;
  const i = o(t.id), a = o(t.shoppingListId) ?? o(t.shopping_list_id);
  if (!(!i || !a))
    return {
      id: i,
      shoppingListId: a,
      title: ht(t),
      checked: !!t.checked,
      raw: t
    };
}
function ht(e) {
  const t = o(e.display);
  if (t) return t;
  const i = o(e.quantity), a = o(v(e.unit)?.name) ?? o(e.unit), r = o(v(e.food)?.name) ?? o(e.food), s = o(e.note);
  return [i && i !== "0" ? i : void 0, a, r, s].filter(Boolean).join(" ") || "Item";
}
function ut(e, t) {
  const i = e.raw;
  return le({
    shoppingListId: e.shoppingListId,
    checked: t,
    position: i.position ?? 0,
    quantity: i.quantity ?? 1,
    food: i.food,
    unit: i.unit,
    note: i.note ?? "",
    display: i.display ?? e.title,
    foodId: i.foodId ?? i.food_id,
    labelId: i.labelId ?? i.label_id,
    unitId: i.unitId ?? i.unit_id,
    extras: i.extras ?? {},
    recipeReferences: i.recipeReferences ?? i.recipe_references ?? []
  });
}
function $e(e, t) {
  const i = e.raw, a = e.recipeId ?? i.recipeId ?? i.recipe_id ?? v(i.recipe)?.id;
  return le({
    id: e.id ?? i.id,
    groupId: i.groupId ?? i.group_id,
    userId: i.userId ?? i.user_id,
    date: t.date ?? e.date,
    entryType: t.entryType ?? e.entryType,
    title: t.title ?? e.title,
    text: t.text ?? e.text ?? "",
    recipeId: a ?? null
  }, ["text"]);
}
function mt(e) {
  const t = gt(e.servings), i = J(e.ingredients), a = J(e.instructions), r = J(e.notes);
  return {
    name: e.name.trim(),
    ...le({
      description: e.description.trim(),
      orgURL: e.source.trim(),
      recipeServings: t,
      recipeYield: t ? `${t} servings` : void 0,
      prepTime: Z(e.prep),
      cookTime: Z(e.cook),
      totalTime: Z(e.total),
      recipeIngredient: i.length ? i.map((s) => ({
        note: s,
        display: s,
        originalText: s
      })) : void 0,
      recipeInstructions: a.length ? a.map((s) => ({
        title: "",
        summary: "",
        text: s,
        ingredientReferences: []
      })) : void 0,
      notes: r.length ? r.map((s) => ({
        title: "",
        text: s
      })) : void 0,
      parseIngredients: e.parseIngredients,
      ingredientParser: e.ingredientParser
    })
  };
}
function J(e) {
  return e.split(/\r?\n/).map((t) => t.trim()).filter(Boolean);
}
function gt(e) {
  const t = Number(e);
  return Number.isFinite(t) && t > 0 ? t : void 0;
}
function Z(e) {
  const t = e.trim();
  if (t)
    return /^\d+$/.test(t) ? `${t} min` : t;
}
function ft(e, t) {
  const i = o(e), a = o(t);
  return i && a && a !== i ? a.toLocaleLowerCase().includes("serv") ? a : `${i} (${a})` : i ?? a;
}
function yt(e) {
  return _(e).map((t) => {
    if (typeof t == "string") return t;
    const i = v(t);
    if (!i) return;
    const a = o(i.display);
    if (a) return a;
    const r = o(i.note), s = o(v(i.food)?.name) ?? o(i.food), n = o(i.quantity), m = o(v(i.unit)?.name) ?? o(i.unit);
    return [n && n !== "0" ? n : void 0, m, s, r].filter(Boolean).join(" ");
  }).filter((t) => !!t);
}
function vt(e) {
  return _(e).flatMap((t) => {
    if (typeof t == "string") return [U(t)];
    const i = v(t), a = o(i?.text) ?? o(i?.instruction) ?? o(i?.summary);
    return a ? [U(a)] : [];
  }).filter(Boolean);
}
function xt(e) {
  if (typeof e == "string") {
    const t = U(e);
    return t ? [{ text: t }] : [];
  }
  return _(e).map((t) => {
    if (typeof t == "string") {
      const n = U(t);
      return n ? { text: n } : void 0;
    }
    const i = v(t);
    if (!i) return;
    const a = o(i.title) ?? o(i.name), r = o(i.text) ?? o(i.note) ?? o(i.summary), s = r ? U(r) : void 0;
    if (!(!s && !a))
      return {
        title: s ? a : void 0,
        text: s ?? a ?? ""
      };
  }).filter((t) => !!t?.text);
}
function _(e) {
  if (Array.isArray(e)) return e;
  const t = v(e);
  if (!t) return [];
  const i = [t.items, t.data, t.results, t.recipe, t.recipes, t.mealplans, t.mealplan];
  for (const a of i)
    if (Array.isArray(a)) return a;
  return [];
}
function v(e) {
  if (!(!e || typeof e != "object" || Array.isArray(e)))
    return e;
}
function le(e, t = []) {
  return Object.fromEntries(
    Object.entries(e).filter(([i, a]) => a !== void 0 && (a !== "" || t.includes(i)))
  );
}
function $t(e) {
  try {
    const t = window.localStorage.getItem(e);
    if (!t) return;
    const i = JSON.parse(t);
    return v(i);
  } catch {
    return;
  }
}
function bt(e, t) {
  try {
    window.localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Me(e, t) {
  const i = e.trim(), a = E(i);
  return t.find((s) => E(s) === a) ?? i.toLocaleLowerCase();
}
function E(e) {
  return e.trim().toLocaleLowerCase().replace(/[\s_-]+/g, "_");
}
function o(e) {
  if (!(e == null || e === ""))
    return String(e);
}
function ke(e, t, i) {
  const a = o(t?.image) ?? o(t?.image_url) ?? o(t?.recipe_image);
  return a && /^https?:\/\//i.test(a) ? a : e && a && i ? `/api/family_mealie/recipe/${encodeURIComponent(e)}/image?token=${encodeURIComponent(i)}` : void 0;
}
function Q(e) {
  const t = o(e);
  if (t)
    return /^\d+$/.test(t) ? `${t} min` : t.replace(/^PT/i, "").replace(/(\d+)H/i, "$1 hr ").replace(/(\d+)M/i, "$1 min").trim();
}
function U(e) {
  const t = document.createElement("div");
  return t.innerHTML = e, t.textContent?.trim() ?? e;
}
function f(e) {
  return e.currentTarget.value;
}
function K(e) {
  return new Date(e.getFullYear(), e.getMonth(), e.getDate());
}
function te(e, t) {
  const i = new Date(e);
  return i.setDate(i.getDate() + t), i;
}
function wt(e, t) {
  const i = K(e), a = (i.getDay() - t + 7) % 7;
  return te(i, -a);
}
function M(e) {
  const t = e.getFullYear(), i = String(e.getMonth() + 1).padStart(2, "0"), a = String(e.getDate()).padStart(2, "0");
  return `${t}-${i}-${a}`;
}
function St(e) {
  const [t, i, a] = e.split("-").map(Number);
  return new Date(t, i - 1, a);
}
function _t(e) {
  if (typeof e == "number" && Number.isInteger(e)) return (e % 7 + 7) % 7;
  const t = String(e ?? "sunday").trim().toLocaleLowerCase(), i = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], a = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"], r = i.indexOf(t);
  if (r >= 0) return r;
  const s = a.indexOf(t);
  return s >= 0 ? s : 0;
}
function P(e) {
  return e.replace(/[_-]/g, " ").replace(/\b\w/g, (t) => t.toLocaleUpperCase());
}
function $(e, t) {
  return e instanceof Error ? e.message : typeof e == "object" && e && "message" in e ? String(e.message) : t;
}
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "family-mealie-planner-card",
  name: "Family Mealie Planner",
  description: "Kitchen-tablet meal planning for Mealie through a Home Assistant backend bridge."
});
export {
  c as FamilyMealiePlannerCard
};
//# sourceMappingURL=family-mealie-planner-card.js.map

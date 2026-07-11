/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, ee = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, te = Symbol(), oe = /* @__PURE__ */ new WeakMap();
let xe = class {
  constructor(e, i, a) {
    if (this._$cssResult$ = !0, a !== te) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (ee && e === void 0) {
      const a = i !== void 0 && i.length === 1;
      a && (e = oe.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), a && oe.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ae = (t) => new xe(typeof t == "string" ? t : t + "", void 0, te), ke = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((a, r, s) => a + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[s + 1], t[0]);
  return new xe(i, t, te);
}, Ie = (t, e) => {
  if (ee) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const a = document.createElement("style"), r = j.litNonce;
    r !== void 0 && a.setAttribute("nonce", r), a.textContent = i.cssText, t.appendChild(a);
  }
}, le = ee ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const a of e.cssRules) i += a.cssText;
  return Ae(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Pe, defineProperty: Ce, getOwnPropertyDescriptor: Le, getOwnPropertyNames: Oe, getOwnPropertySymbols: Ue, getPrototypeOf: Ne } = Object, V = globalThis, ce = V.trustedTypes, ze = ce ? ce.emptyScript : "", Fe = V.reactiveElementPolyfillSupport, L = (t, e) => t, q = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? ze : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let i = t;
  switch (e) {
    case Boolean:
      i = t !== null;
      break;
    case Number:
      i = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(t);
      } catch {
        i = null;
      }
  }
  return i;
} }, ie = (t, e) => !Pe(t, e), pe = { attribute: !0, type: String, converter: q, reflect: !1, useDefault: !1, hasChanged: ie };
Symbol.metadata ??= Symbol("metadata"), V.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let R = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = pe) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const a = Symbol(), r = this.getPropertyDescriptor(e, a, i);
      r !== void 0 && Ce(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, a) {
    const { get: r, set: s } = Le(this.prototype, e) ?? { get() {
      return this[i];
    }, set(n) {
      this[i] = n;
    } };
    return { get: r, set(n) {
      const m = r?.call(this);
      s?.call(this, n), this.requestUpdate(e, m, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? pe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(L("elementProperties"))) return;
    const e = Ne(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(L("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(L("properties"))) {
      const i = this.properties, a = [...Oe(i), ...Ue(i)];
      for (const r of a) this.createProperty(r, i[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0) for (const [a, r] of i) this.elementProperties.set(a, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, a] of this.elementProperties) {
      const r = this._$Eu(i, a);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const a = new Set(e.flat(1 / 0).reverse());
      for (const r of a) i.unshift(le(r));
    } else e !== void 0 && i.push(le(e));
    return i;
  }
  static _$Eu(e, i) {
    const a = i.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const a of i.keys()) this.hasOwnProperty(a) && (e.set(a, this[a]), delete this[a]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ie(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, i, a) {
    this._$AK(e, a);
  }
  _$ET(e, i) {
    const a = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, a);
    if (r !== void 0 && a.reflect === !0) {
      const s = (a.converter?.toAttribute !== void 0 ? a.converter : q).toAttribute(i, a.type);
      this._$Em = e, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(e, i) {
    const a = this.constructor, r = a._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const s = a.getPropertyOptions(r), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : q;
      this._$Em = r;
      const m = n.fromAttribute(i, s.type);
      this[r] = m ?? this._$Ej?.get(r) ?? m, this._$Em = null;
    }
  }
  requestUpdate(e, i, a, r = !1, s) {
    if (e !== void 0) {
      const n = this.constructor;
      if (r === !1 && (s = this[e]), a ??= n.getPropertyOptions(e), !((a.hasChanged ?? ie)(s, i) || a.useDefault && a.reflect && s === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, a)))) return;
      this.C(e, i, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: a, reflect: r, wrapped: s }, n) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? i ?? this[e]), s !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || a || (i = void 0), this._$AL.set(e, i)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
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
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), this._$EO?.forEach((a) => a.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (a) {
      throw e = !1, this._$EM(), a;
    }
    e && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
R.elementStyles = [], R.shadowRootOptions = { mode: "open" }, R[L("elementProperties")] = /* @__PURE__ */ new Map(), R[L("finalized")] = /* @__PURE__ */ new Map(), Fe?.({ ReactiveElement: R }), (V.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ae = globalThis, de = (t) => t, K = ae.trustedTypes, he = K ? K.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, we = "$lit$", _ = `lit$${Math.random().toFixed(9).slice(2)}$`, _e = "?" + _, He = `<${_e}>`, D = document, U = () => D.createComment(""), N = (t) => t === null || typeof t != "object" && typeof t != "function", re = Array.isArray, je = (t) => re(t) || typeof t?.[Symbol.iterator] == "function", Y = `[ 	
\f\r]`, I = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ue = /-->/g, me = />/g, S = RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ge = /'/g, ye = /"/g, Se = /^(?:script|style|textarea|title)$/i, Be = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), l = Be(1), A = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), fe = /* @__PURE__ */ new WeakMap(), T = D.createTreeWalker(D, 129);
function Te(t, e) {
  if (!re(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return he !== void 0 ? he.createHTML(e) : e;
}
const qe = (t, e) => {
  const i = t.length - 1, a = [];
  let r, s = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = I;
  for (let m = 0; m < i; m++) {
    const h = t[m];
    let f, v, g = -1, x = 0;
    for (; x < h.length && (n.lastIndex = x, v = n.exec(h), v !== null); ) x = n.lastIndex, n === I ? v[1] === "!--" ? n = ue : v[1] !== void 0 ? n = me : v[2] !== void 0 ? (Se.test(v[2]) && (r = RegExp("</" + v[2], "g")), n = S) : v[3] !== void 0 && (n = S) : n === S ? v[0] === ">" ? (n = r ?? I, g = -1) : v[1] === void 0 ? g = -2 : (g = n.lastIndex - v[2].length, f = v[1], n = v[3] === void 0 ? S : v[3] === '"' ? ye : ge) : n === ye || n === ge ? n = S : n === ue || n === me ? n = I : (n = S, r = void 0);
    const w = n === S && t[m + 1].startsWith("/>") ? " " : "";
    s += n === I ? h + He : g >= 0 ? (a.push(f), h.slice(0, g) + we + h.slice(g) + _ + w) : h + _ + (g === -2 ? m : w);
  }
  return [Te(t, s + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), a];
};
class z {
  constructor({ strings: e, _$litType$: i }, a) {
    let r;
    this.parts = [];
    let s = 0, n = 0;
    const m = e.length - 1, h = this.parts, [f, v] = qe(e, i);
    if (this.el = z.createElement(f, a), T.currentNode = this.el.content, i === 2 || i === 3) {
      const g = this.el.content.firstChild;
      g.replaceWith(...g.childNodes);
    }
    for (; (r = T.nextNode()) !== null && h.length < m; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const g of r.getAttributeNames()) if (g.endsWith(we)) {
          const x = v[n++], w = r.getAttribute(g).split(_), H = /([.?@])?(.*)/.exec(x);
          h.push({ type: 1, index: s, name: H[2], strings: w, ctor: H[1] === "." ? Ve : H[1] === "?" ? We : H[1] === "@" ? Ye : W }), r.removeAttribute(g);
        } else g.startsWith(_) && (h.push({ type: 6, index: s }), r.removeAttribute(g));
        if (Se.test(r.tagName)) {
          const g = r.textContent.split(_), x = g.length - 1;
          if (x > 0) {
            r.textContent = K ? K.emptyScript : "";
            for (let w = 0; w < x; w++) r.append(g[w], U()), T.nextNode(), h.push({ type: 2, index: ++s });
            r.append(g[x], U());
          }
        }
      } else if (r.nodeType === 8) if (r.data === _e) h.push({ type: 2, index: s });
      else {
        let g = -1;
        for (; (g = r.data.indexOf(_, g + 1)) !== -1; ) h.push({ type: 7, index: s }), g += _.length - 1;
      }
      s++;
    }
  }
  static createElement(e, i) {
    const a = D.createElement("template");
    return a.innerHTML = e, a;
  }
}
function k(t, e, i = t, a) {
  if (e === A) return e;
  let r = a !== void 0 ? i._$Co?.[a] : i._$Cl;
  const s = N(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== s && (r?._$AO?.(!1), s === void 0 ? r = void 0 : (r = new s(t), r._$AT(t, i, a)), a !== void 0 ? (i._$Co ??= [])[a] = r : i._$Cl = r), r !== void 0 && (e = k(t, r._$AS(t, e.values), r, a)), e;
}
class Ke {
  constructor(e, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: i }, parts: a } = this._$AD, r = (e?.creationScope ?? D).importNode(i, !0);
    T.currentNode = r;
    let s = T.nextNode(), n = 0, m = 0, h = a[0];
    for (; h !== void 0; ) {
      if (n === h.index) {
        let f;
        h.type === 2 ? f = new F(s, s.nextSibling, this, e) : h.type === 1 ? f = new h.ctor(s, h.name, h.strings, this, e) : h.type === 6 && (f = new Ge(s, this, e)), this._$AV.push(f), h = a[++m];
      }
      n !== h?.index && (s = T.nextNode(), n++);
    }
    return T.currentNode = D, r;
  }
  p(e) {
    let i = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(e, a, i), i += a.strings.length - 2) : a._$AI(e[i])), i++;
  }
}
class F {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, i, a, r) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = a, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && e?.nodeType === 11 && (e = i.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, i = this) {
    e = k(this, e, i), N(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== A && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : je(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && N(this._$AH) ? this._$AA.nextSibling.data = e : this.T(D.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: i, _$litType$: a } = e, r = typeof a == "number" ? this._$AC(e) : (a.el === void 0 && (a.el = z.createElement(Te(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const s = new Ke(r, this), n = s.u(this.options);
      s.p(i), this.T(n), this._$AH = s;
    }
  }
  _$AC(e) {
    let i = fe.get(e.strings);
    return i === void 0 && fe.set(e.strings, i = new z(e)), i;
  }
  k(e) {
    re(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let a, r = 0;
    for (const s of e) r === i.length ? i.push(a = new F(this.O(U()), this.O(U()), this, this.options)) : a = i[r], a._$AI(s), r++;
    r < i.length && (this._$AR(a && a._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); e !== this._$AB; ) {
      const a = de(e).nextSibling;
      de(e).remove(), e = a;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class W {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, a, r, s) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = s, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = u;
  }
  _$AI(e, i = this, a, r) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) e = k(this, e, i, 0), n = !N(e) || e !== this._$AH && e !== A, n && (this._$AH = e);
    else {
      const m = e;
      let h, f;
      for (e = s[0], h = 0; h < s.length - 1; h++) f = k(this, m[a + h], i, h), f === A && (f = this._$AH[h]), n ||= !N(f) || f !== this._$AH[h], f === u ? e = u : e !== u && (e += (f ?? "") + s[h + 1]), this._$AH[h] = f;
    }
    n && !r && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ve extends W {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class We extends W {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class Ye extends W {
  constructor(e, i, a, r, s) {
    super(e, i, a, r, s), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = k(this, e, i, 0) ?? u) === A) return;
    const a = this._$AH, r = e === u && a !== u || e.capture !== a.capture || e.once !== a.once || e.passive !== a.passive, s = e !== u && (a === u || r);
    r && this.element.removeEventListener(this.name, this, a), s && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ge {
  constructor(e, i, a) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    k(this, e);
  }
}
const Xe = ae.litHtmlPolyfillSupport;
Xe?.(z, F), (ae.litHtmlVersions ??= []).push("3.3.3");
const Ze = (t, e, i) => {
  const a = i?.renderBefore ?? e;
  let r = a._$litPart$;
  if (r === void 0) {
    const s = i?.renderBefore ?? null;
    a._$litPart$ = r = new F(e.insertBefore(U(), s), s, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = globalThis;
class O extends R {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ze(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return A;
  }
}
O._$litElement$ = !0, O.finalized = !0, se.litElementHydrateSupport?.({ LitElement: O });
const Je = se.litElementPolyfillSupport;
Je?.({ LitElement: O });
(se.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qe = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = { attribute: !0, type: String, converter: q, reflect: !1, hasChanged: ie }, tt = (t = et, e, i) => {
  const { kind: a, metadata: r } = i;
  let s = globalThis.litPropertyMetadata.get(r);
  if (s === void 0 && globalThis.litPropertyMetadata.set(r, s = /* @__PURE__ */ new Map()), a === "setter" && ((t = Object.create(t)).wrapped = !0), s.set(i.name, t), a === "accessor") {
    const { name: n } = i;
    return { set(m) {
      const h = e.get.call(this);
      e.set.call(this, m), this.requestUpdate(n, h, t, !0, m);
    }, init(m) {
      return m !== void 0 && this.C(n, void 0, t, m), m;
    } };
  }
  if (a === "setter") {
    const { name: n } = i;
    return function(m) {
      const h = this[n];
      e.call(this, m), this.requestUpdate(n, h, t, !0, m);
    };
  }
  throw Error("Unsupported decorator location: " + a);
};
function Me(t) {
  return (e, i) => typeof i == "object" ? tt(t, e, i) : ((a, r, s) => {
    const n = r.hasOwnProperty(s);
    return r.constructor.createProperty(s, a), n ? Object.getOwnPropertyDescriptor(r, s) : void 0;
  })(t, e, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(t) {
  return Me({ ...t, state: !0, attribute: !1 });
}
var it = Object.defineProperty, at = Object.getOwnPropertyDescriptor, p = (t, e, i, a) => {
  for (var r = a > 1 ? void 0 : a ? at(e, i) : e, s = t.length - 1, n; s >= 0; s--)
    (n = t[s]) && (r = (a ? n(e, i, r) : n(r)) || r);
  return a && r && it(e, i, r), r;
};
const B = ["breakfast", "lunch", "dinner"], rt = ["Leftovers:", "Eat Out:", "Freezer Meal:", "Kids:"];
let c = class extends O {
  constructor() {
    super(...arguments), this.config = { type: "custom:family-mealie-planner-card" }, this.view = "planner", this.recipes = [], this.mealPlan = [], this.shoppingLists = [], this.loading = !1, this.addDialogOpen = !1, this.recipeDialogOpen = !1, this.mealEditDate = "", this.mealEditEntryType = "", this.mealSaving = !1, this.recipeLoading = !1, this.search = "", this.noteText = "", this.noteEditTitle = "", this.noteEditText = "", this.plannerOffsetDays = 0, this.recipeCreateOpen = !1, this.recipeCreateMode = "url", this.recipeUrl = "", this.manualRecipeName = "", this.manualRecipeSource = "", this.manualRecipeDescription = "", this.manualRecipeServings = "", this.manualRecipePrep = "", this.manualRecipeCook = "", this.manualRecipeTotal = "", this.manualRecipeIngredients = "", this.manualRecipeInstructions = "", this.manualParseIngredients = !0, this.recipeSaving = !1, this.groceryText = "", this.newListName = "", this.suppressMealClickUntil = 0, this.resetPlannerRange = async () => {
      this.plannerOffsetDays = 0, await this.reloadPlannerRange();
    }, this.toggleRecipeCreate = () => {
      this.recipeCreateOpen = !this.recipeCreateOpen, this.recipeCreateOpen && (this.recipeMessage = void 0);
    }, this.openDefaultAddDialog = () => {
      const t = this.daysToShow()[0] ?? J(/* @__PURE__ */ new Date()), e = this.entryTypes()[0] ?? B[0];
      this.openAddDialog({ date: P(t), entryType: e });
    }, this.closeAddDialog = () => {
      this.addDialogOpen = !1;
    }, this.closeRecipeDialog = () => {
      this.recipeDialogOpen = !1, this.mealSaving = !1;
    }, this.onMealEditDateInput = (t) => {
      this.mealEditDate = y(t);
    }, this.onMealEditEntryTypeInput = (t) => {
      this.mealEditEntryType = this.canonicalEntryType(y(t));
    }, this.moveMealPointer = (t) => {
      const e = this.pointerDrag;
      if (!e || e.pointerId !== t.pointerId) return;
      const i = Math.hypot(t.clientX - e.startX, t.clientY - e.startY);
      if (!e.active) {
        i > 10 && this.cancelMealPointer();
        return;
      }
      t.preventDefault();
    }, this.endMealPointer = (t) => {
      const e = this.pointerDrag;
      if (!e || e.pointerId !== t.pointerId || (e.holdTimer && window.clearTimeout(e.holdTimer), e.source.releasePointerCapture?.(t.pointerId), this.pointerDrag = void 0, !e.active)) return;
      t.preventDefault(), t.stopPropagation(), this.suppressMealClickUntil = Date.now() + 350;
      const i = this.dropTargetFromPoint(t.clientX, t.clientY);
      if (this.clearDraggingState(), !i) return;
      const a = this.mealPlan.find((r) => String(r.id) === e.mealId);
      a && this.moveMeal(a, i.date, i.entryType ?? a.entryType);
    }, this.cancelMealPointer = () => {
      this.pointerDrag?.holdTimer && window.clearTimeout(this.pointerDrag.holdTimer), this.pointerDrag?.source.releasePointerCapture?.(this.pointerDrag.pointerId), this.pointerDrag = void 0, this.clearDraggingState();
    }, this.onPlannerDragOver = (t) => {
      this.draggingMealId && (t.preventDefault(), t.dataTransfer && (t.dataTransfer.dropEffect = "move"));
    }, this.onGroceryKeyDown = (t) => {
      t.key === "Enter" && this.addShoppingItem(t);
    };
  }
  setConfig(t) {
    if (!t || t.type !== "custom:family-mealie-planner-card")
      throw new Error("Invalid card type. Use custom:family-mealie-planner-card.");
    this.config = {
      title: "Meals",
      days: 7,
      entry_types: B,
      result_limit: 300,
      refresh_minutes: 15,
      ...t
    }, this.restartRefreshTimer();
  }
  connectedCallback() {
    super.connectedCallback(), this.restartRefreshTimer();
  }
  disconnectedCallback() {
    window.clearInterval(this.refreshTimer), super.disconnectedCallback();
  }
  firstUpdated() {
    this.refreshAll();
  }
  updated(t) {
    t.has("hass") && this.hass && this.recipes.length === 0 && this.mealPlan.length === 0 && this.refreshAll(), (t.has("addDialogOpen") || t.has("recipeDialogOpen") || t.has("mealEditEntryType") || t.has("selectedMeal") || t.has("selectedSlot")) && (this.syncNativeDialogs(), this.syncNativeSelects());
  }
  getCardSize() {
    return 8;
  }
  render() {
    return l`
      <ha-card>
        <section class="shell">
          <header class="topbar">
            <div>
              <h2>${this.config.title}</h2>
              <p>${this.subtitle()}</p>
            </div>
            <div class="top-actions">
              ${this.view === "planner" ? l`<button class="secondary action" @click=${this.openDefaultAddDialog}>Add meal</button>` : u}
              <button class="primary action" title="Refresh" @click=${this.refreshAll} ?disabled=${this.loading}>
                ${this.loading ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </header>

          <nav class="tabs">
            ${this.renderTab("planner", "Planner")}
            ${this.renderTab("recipes", "Recipes")}
            ${this.renderTab("groceries", "Groceries")}
          </nav>

          ${this.error ? l`<div class="notice">${this.error}</div>` : u}
          ${this.view === "planner" ? this.renderPlanner() : u}
          ${this.view === "recipes" ? this.renderRecipes() : u}
          ${this.view === "groceries" ? this.renderGroceries() : u}
        </section>
      </ha-card>

      ${this.renderAddDialog()} ${this.renderRecipeDialog()}
    `;
  }
  renderTab(t, e) {
    return l`
      <button class=${this.view === t ? "active" : ""} @click=${() => this.openView(t)}>
        ${e}
      </button>
    `;
  }
  renderPlanner() {
    const t = this.daysToShow();
    return l`
      <div class="planner-nav">
        <button class="plain" @click=${() => this.shiftPlannerRange(-this.rangeStepDays())}>Previous week</button>
        <button class="plain" @click=${this.resetPlannerRange} ?disabled=${this.plannerOffsetDays === 0}>This week</button>
        <button class="plain" @click=${() => this.shiftPlannerRange(this.rangeStepDays())}>Next week</button>
      </div>
      <div class="board" style=${`--day-count:${t.length}`}>
        ${t.map((e) => this.renderDay(e))}
      </div>
    `;
  }
  renderDay(t) {
    const e = P(t), i = this.hasMealsForDay(e);
    return l`
      <article
        class="day"
        data-drop-date=${e}
        @dragover=${this.onPlannerDragOver}
        @drop=${(a) => this.dropMeal(a, e)}
      >
        <div class="day-head">
          <span>${this.formatWeekday(t)}</span>
          <strong>${this.formatMonthDay(t)}</strong>
        </div>
        ${this.renderDropTargets(e)}
        <div class="meal-sections">
          ${i ? this.entryTypes().map((a) => this.renderMealSection(t, a)) : l`<div class="empty-day">No meals planned</div>`}
        </div>
      </article>
    `;
  }
  renderMealSection(t, e) {
    const i = P(t), a = this.mealsFor(i, e);
    return a.length ? l`
      <section
        class="meal-section"
        data-drop-date=${i}
        data-drop-entry-type=${e}
        @dragover=${this.onPlannerDragOver}
        @drop=${(r) => this.dropMeal(r, i, e)}
      >
        <header>
          <span>${C(e)}</span>
        </header>
        <div class="meal-list">
          ${a.map((r) => this.renderMealCard(r))}
        </div>
      </section>
    ` : u;
  }
  renderMealOption(t) {
    return l`
      <button
        type="button"
        class=${this.selectedRecipeKey(t) === this.selectedRecipeKey(this.selectedRecipe) ? "selected" : ""}
        @click=${() => this.chooseRecipe(t)}
      >
        ${t.image ? l`<img src=${t.image} alt="" loading="lazy" />` : l`<span class="thumb">${t.name.slice(0, 1)}</span>`}
        <span>${t.name}</span>
      </button>
    `;
  }
  renderMealCard(t) {
    return l`
      <button
        class="meal-pill"
        draggable="false"
        @pointerdown=${(e) => this.startMealPointer(e, t)}
        @pointermove=${this.moveMealPointer}
        @pointerup=${this.endMealPointer}
        @pointercancel=${this.cancelMealPointer}
        @click=${(e) => this.onMealCardClick(e, t)}
      >
        <strong>${t.title}</strong>
        ${t.text && t.text !== t.title ? l`<small>${t.text}</small>` : u}
      </button>
    `;
  }
  renderDropTargets(t) {
    return l`
      <div class="drop-targets">
        ${this.entryTypes().map(
      (e) => l`
            <button
              type="button"
              data-drop-date=${t}
              data-drop-entry-type=${e}
              @dragover=${this.onPlannerDragOver}
              @drop=${(i) => this.dropMeal(i, t, e)}
            >
              ${C(e)}
            </button>
          `
    )}
      </div>
    `;
  }
  renderRecipes() {
    const t = this.filteredRecipes();
    return l`
      <div class="recipe-toolbar">
        <label>
          Search recipes
          <input
            type="search"
            placeholder="Pasta, tacos, soup..."
            .value=${this.search}
            @input=${(e) => this.search = y(e)}
          />
        </label>
        <button class="secondary" @click=${this.toggleRecipeCreate}>
          ${this.recipeCreateOpen ? "Hide add recipe" : "Add recipe"}
        </button>
      </div>

      ${this.recipeCreateOpen ? l`
            <section class="recipe-create-panel">
              <header>
                <h3>Add recipe</h3>
                <div class="mode-tabs">
                  <button class=${this.recipeCreateMode === "url" ? "active" : ""} @click=${() => this.recipeCreateMode = "url"}>
                    Import URL
                  </button>
                  <button class=${this.recipeCreateMode === "manual" ? "active" : ""} @click=${() => this.recipeCreateMode = "manual"}>
                    Manual
                  </button>
                </div>
              </header>
              ${this.recipeMessage ? l`<div class="success">${this.recipeMessage}</div>` : u}
              ${this.recipeCreateMode === "url" ? this.renderRecipeUrlCreate() : this.renderRecipeManualCreate()}
            </section>
          ` : this.recipeMessage ? l`<div class="success compact">${this.recipeMessage}</div>` : u}

      <div class="recipe-grid">
        ${t.map(
      (e) => l`
            <button class="recipe-tile" @click=${() => this.openRecipeSummaryDialog(e)}>
              ${e.image ? l`<img src=${e.image} alt="" loading="lazy" />` : l`<span class="thumb">${e.name.slice(0, 1)}</span>`}
              <span>${e.name}</span>
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
            @input=${(t) => this.recipeUrl = y(t)}
          />
        </label>
        <button class="primary" @click=${this.importRecipeUrl} ?disabled=${this.recipeSaving || !this.recipeUrl.trim()}>
          ${this.recipeSaving ? "Importing" : "Import"}
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
            @input=${(t) => this.manualRecipeName = y(t)}
          />
        </label>
        <label>
          Source URL
          <input
            type="url"
            placeholder="https://..."
            .value=${this.manualRecipeSource}
            @input=${(t) => this.manualRecipeSource = y(t)}
          />
        </label>
        <label class="span-2">
          Description
          <textarea
            .value=${this.manualRecipeDescription}
            @input=${(t) => this.manualRecipeDescription = y(t)}
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
              @input=${(t) => this.manualRecipeServings = y(t)}
            />
          </label>
          <label>
            Prep
            <input
              type="text"
              placeholder="15 min"
              .value=${this.manualRecipePrep}
              @input=${(t) => this.manualRecipePrep = y(t)}
            />
          </label>
          <label>
            Cook
            <input
              type="text"
              placeholder="30 min"
              .value=${this.manualRecipeCook}
              @input=${(t) => this.manualRecipeCook = y(t)}
            />
          </label>
          <label>
            Total
            <input
              type="text"
              placeholder="45 min"
              .value=${this.manualRecipeTotal}
              @input=${(t) => this.manualRecipeTotal = y(t)}
            />
          </label>
        </div>
        <label>
          Ingredients
          <textarea
            class="tall"
            .value=${this.manualRecipeIngredients}
            @input=${(t) => this.manualRecipeIngredients = y(t)}
          ></textarea>
        </label>
        <label>
          Instructions
          <textarea
            class="tall"
            .value=${this.manualRecipeInstructions}
            @input=${(t) => this.manualRecipeInstructions = y(t)}
          ></textarea>
        </label>
        <label class="check-row span-2">
          <input
            type="checkbox"
            .checked=${this.manualParseIngredients}
            @change=${(t) => this.manualParseIngredients = t.currentTarget.checked}
          />
          <span>Use Mealie ingredient parser</span>
        </label>
        <footer class="span-2">
          <button class="primary" @click=${this.createManualRecipe} ?disabled=${this.recipeSaving || !this.manualRecipeName.trim()}>
            ${this.recipeSaving ? "Saving" : "Save recipe"}
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
            <button class="small" @click=${this.createShoppingList} ?disabled=${!this.newListName.trim()}>Create</button>
          </div>
          <input
            type="text"
            placeholder="New list"
            .value=${this.newListName}
            @input=${(t) => this.newListName = y(t)}
          />
          <div class="list-buttons">
            ${this.shoppingLists.map(
      (t) => l`
                <button
                  class=${this.selectedShoppingListId === t.id ? "selected" : ""}
                  @click=${() => this.selectShoppingList(t.id)}
                >
                  <span>${t.name}</span>
                  ${t.itemCount !== void 0 ? l`<small>${t.itemCount}</small>` : u}
                </button>
              `
    )}
          </div>
        </aside>

        <section class="grocery-main">
          ${this.selectedShoppingList ? l`
                <header>
                  <h3>${this.selectedShoppingList.name}</h3>
                  <button class="plain" @click=${() => this.selectedShoppingListId && this.loadShoppingList(this.selectedShoppingListId)}>
                    Refresh
                  </button>
                </header>
                <div class="add-grocery">
                  <input
                    type="text"
                    placeholder="Add grocery item"
                    .value=${this.groceryText}
                    @input=${(t) => this.groceryText = y(t)}
                    @keydown=${this.onGroceryKeyDown}
                  />
                  <button class="primary" @click=${this.addShoppingItem} ?disabled=${!this.groceryText.trim()}>Add</button>
                </div>
                <div class="grocery-items">
                  ${this.selectedShoppingList.items.map((t) => this.renderShoppingItem(t))}
                </div>
              ` : l`<div class="empty-panel">Create or choose a grocery list.</div>`}
        </section>
      </section>
    `;
  }
  renderShoppingItem(t) {
    return l`
      <label class="grocery-item">
        <input
          type="checkbox"
          .checked=${t.checked}
          @change=${(e) => this.toggleShoppingItem(t, e.currentTarget.checked)}
        />
        <span>${t.title}</span>
        <button class="delete-inline" @click=${(e) => this.deleteShoppingItem(e, t)}>Remove</button>
      </label>
    `;
  }
  renderAddDialog() {
    if (!this.addDialogOpen || !this.selectedSlot) return u;
    const t = this.filteredRecipes().slice(0, 36);
    return l`
      <dialog class="dialog add" @cancel=${this.closeAddDialog}>
        <form method="dialog" class="dialog-panel">
          <header>
            <div>
              <span>Add meal</span>
              <h3>${C(this.selectedSlot.entryType)} · ${this.formatDialogDate(this.selectedSlot.date)}</h3>
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
              @input=${(e) => this.search = y(e)}
            />
          </label>

          <div class="recipe-results">
            ${t.map(
      (e) => l`
                ${this.renderMealOption(e)}
              `
    )}
          </div>

          <div class="note-area">
            <span>Or add a note</span>
            <div class="chips">
              ${rt.map(
      (e) => l`
                  <button type="button" @click=${() => this.chooseNote(e)}>
                    ${e}
                  </button>
                `
    )}
            </div>
            <input
              type="text"
              placeholder="Custom note"
              .value=${this.noteText}
              @input=${(e) => {
      this.noteText = y(e), this.noteText && (this.selectedRecipe = void 0);
    }}
            />
          </div>

          <footer>
            <button type="button" class="primary" @click=${this.addMeal} ?disabled=${!this.selectedRecipe && !this.noteText.trim()}>
              Add to plan
            </button>
          </footer>
        </form>
      </dialog>
    `;
  }
  renderRecipeDialog() {
    if (!this.recipeDialogOpen || !this.selectedMeal && !this.selectedRecipeForDialog) return u;
    const t = this.recipeDetail, e = this.selectedMeal?.title ?? this.selectedRecipeForDialog?.name ?? "Recipe", i = this.selectedMeal?.entryType, a = !!(this.selectedMeal && !this.selectedMeal.recipeSlug && !this.selectedMeal.recipeId);
    return l`
      <dialog class="dialog recipe" @cancel=${this.closeRecipeDialog}>
        <article class="dialog-panel cook-panel">
          <header>
            <div>
              <span>${i ? C(i) : "Recipe"}</span>
              <h3>${e}</h3>
            </div>
            <button type="button" class="plain" @click=${this.closeRecipeDialog}>Close</button>
          </header>

          ${this.recipeLoading ? l`<div class="loading">Loading recipe...</div>` : l`
              ${this.selectedMeal ? this.renderMealPlacementEditor() : u}
              ${a ? this.renderNoteEditor() : l`
                ${t?.image || this.selectedMeal?.image ? l`<img class="hero-image" src=${t?.image ?? this.selectedMeal?.image ?? ""} alt="" />` : u}

                <div class="stats">
                  ${this.stat("Servings", t?.servings)}
                  ${this.stat("Prep", t?.prepTime)}
                  ${this.stat("Cook", t?.cookTime)}
                  ${this.stat("Total", t?.totalTime)}
                </div>

                ${t?.ingredients.length ? l`
                      <section class="cook-section">
                        <h4>Ingredients</h4>
                        <ul>
                          ${t.ingredients.map((r) => l`<li>${r}</li>`)}
                        </ul>
                      </section>
                    ` : this.selectedMeal?.text ? l`<section class="cook-section note"><p>${this.selectedMeal.text}</p></section>` : u}

                ${t?.instructions.length ? l`
                      <section class="cook-section">
                        <h4>Instructions</h4>
                        <ol>
                          ${t.instructions.map((r) => l`<li>${r}</li>`)}
                        </ol>
                      </section>
                    ` : u}
              `}
            `}

          <footer class="recipe-actions">
            ${a ? l`
                  <button class="primary" @click=${this.saveNoteMeal} ?disabled=${this.mealSaving || !this.noteEditTitle.trim()}>
                    ${this.mealSaving ? "Saving" : "Save note"}
                  </button>
                ` : u}
            ${this.selectedMeal && !a ? l`
                  <button class="primary" @click=${this.saveMealPlacement} ?disabled=${this.mealSaving || !this.mealPlacementChanged()}>
                    ${this.mealSaving ? "Saving" : "Save changes"}
                  </button>
                ` : u}
            ${!a && t?.id && this.shoppingLists.length ? l`
                  <select .value=${this.selectedShoppingListId ?? ""} @change=${(r) => this.selectShoppingList(y(r))}>
                    ${this.shoppingLists.map((r) => l`<option .value=${r.id}>${r.name}</option>`)}
                  </select>
                  <button class="primary" @click=${() => t?.id && this.addRecipeToGroceries(t.id)}>
                    Add ingredients
                  </button>
                ` : u}
            ${this.selectedMeal ? l`<button class="danger" @click=${() => this.selectedMeal && this.confirmDeleteMeal(this.selectedMeal)}>Remove meal</button>` : u}
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
            @input=${(t) => this.noteEditTitle = y(t)}
          />
        </label>
        <label>
          Note
          <textarea
            .value=${this.noteEditText}
            @input=${(t) => this.noteEditText = y(t)}
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
  renderEntryTypeOptions(t) {
    const e = E(t);
    return this.entryTypes().map(
      (i) => l`<option value=${i} ?selected=${E(i) === e}>${C(i)}</option>`
    );
  }
  stat(t, e) {
    return e ? l`<div><span>${t}</span><strong>${e}</strong></div>` : u;
  }
  async refreshAll() {
    if (!(!this.hass || this.loading)) {
      this.loading = !0, this.error = void 0;
      try {
        await this.loadInfo(), await Promise.all([this.loadRecipes(), this.loadMealPlan(), this.loadShoppingLists()]);
      } catch (t) {
        this.error = b(t, "Could not load Mealie data through Home Assistant.");
      } finally {
        this.loading = !1;
      }
    }
  }
  async loadInfo() {
    const t = await this.callFamilyMealie("family_mealie/info"), e = $(t);
    this.imageToken = o(e?.image_token) ?? o(e?.imageToken);
  }
  async loadRecipes() {
    const t = await this.callFamilyMealie("family_mealie/recipes", {
      limit: this.config.result_limit ?? 300
    });
    this.recipes = M(t).map((e) => De(e, this.imageToken)).filter(Boolean);
  }
  async loadMealPlan() {
    const [t, e] = this.dateRange(), i = await this.callFamilyMealie("family_mealie/mealplans", {
      start_date: t,
      end_date: e,
      limit: -1
    });
    this.mealPlan = M(i).map((a) => ot(a, this.imageToken, this.entryTypes())).filter(Boolean);
  }
  async loadShoppingLists() {
    const t = await this.callFamilyMealie("family_mealie/shopping_lists", { limit: -1 }), e = M(t).map(Z).filter(Boolean);
    this.shoppingLists = e, !this.selectedShoppingListId && e.length && (this.selectedShoppingListId = e[0].id), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
  }
  async loadShoppingList(t) {
    const e = await this.callFamilyMealie("family_mealie/shopping_list", { list_id: t }), i = lt(e);
    i && (this.selectedShoppingList = i, this.selectedShoppingListId = i.id);
  }
  async fetchRecipeDetail(t) {
    const e = st(t) ? t.recipeSlug : t.slug;
    if (!e) return;
    const i = await this.callFamilyMealie("family_mealie/recipe", { slug: e });
    return nt(i, this.imageToken);
  }
  async importRecipeUrl(t) {
    t.preventDefault();
    const e = this.recipeUrl.trim();
    if (e) {
      this.recipeSaving = !0, this.recipeMessage = void 0, this.error = void 0;
      try {
        await this.callFamilyMealie("family_mealie/recipes/import_url", {
          url: e,
          include_tags: !0,
          include_categories: !0,
          parse_ingredients: !0,
          ingredient_parser: this.config.ingredient_parser ?? "auto"
        }), this.recipeUrl = "", this.recipeMessage = "Recipe imported.", await this.loadRecipes();
      } catch (i) {
        this.error = b(i, "Could not import recipe.");
      } finally {
        this.recipeSaving = !1;
      }
    }
  }
  async createManualRecipe(t) {
    t.preventDefault();
    const e = ht({
      name: this.manualRecipeName,
      source: this.manualRecipeSource,
      description: this.manualRecipeDescription,
      servings: this.manualRecipeServings,
      prep: this.manualRecipePrep,
      cook: this.manualRecipeCook,
      total: this.manualRecipeTotal,
      ingredients: this.manualRecipeIngredients,
      instructions: this.manualRecipeInstructions,
      parseIngredients: this.manualParseIngredients,
      ingredientParser: this.config.ingredient_parser ?? "auto"
    });
    if (e.name) {
      this.recipeSaving = !0, this.recipeMessage = void 0, this.error = void 0;
      try {
        await this.callFamilyMealie("family_mealie/recipes/create", { payload: e }), this.clearManualRecipeForm(), this.recipeMessage = "Recipe saved.", await this.loadRecipes();
      } catch (i) {
        this.error = b(i, "Could not save recipe.");
      } finally {
        this.recipeSaving = !1;
      }
    }
  }
  async addMeal(t) {
    if (t.preventDefault(), !this.selectedSlot) return;
    const e = this.selectedRecipe, i = this.noteText.trim(), a = {
      date: this.selectedSlot.date,
      entryType: this.canonicalEntryType(this.selectedSlot.entryType),
      title: "",
      text: ""
    };
    e?.id ? a.recipeId = e.id : i && (a.title = i, a.text = i);
    try {
      await this.callFamilyMealie("family_mealie/mealplans/create", { payload: a }), this.closeAddDialog(), await this.loadMealPlan();
    } catch (r) {
      this.error = b(r, "Could not add meal.");
    }
  }
  async saveNoteMeal(t) {
    t.preventDefault();
    const e = this.selectedMeal;
    if (!e?.id) return;
    const i = this.noteEditTitle.trim();
    if (!i) return;
    const a = this.noteEditText.trim() || i, r = ve(e, {
      date: this.mealEditDate || e.date,
      entryType: this.canonicalEntryType(this.mealEditEntryType || e.entryType),
      title: i,
      text: a
    });
    this.mealSaving = !0;
    try {
      await this.callFamilyMealie("family_mealie/mealplans/update", { meal_id: e.id, payload: r }), this.selectedMeal = {
        ...e,
        date: String(r.date ?? e.date),
        entryType: String(r.entryType ?? e.entryType),
        title: i,
        text: a,
        raw: { ...e.raw, ...r }
      }, await this.loadMealPlan(), this.closeRecipeDialog();
    } catch (s) {
      this.error = b(s, "Could not save meal.");
    } finally {
      this.mealSaving = !1;
    }
  }
  async saveMealPlacement(t) {
    t.preventDefault();
    const e = this.selectedMeal;
    e?.id && await this.moveMeal(e, this.mealEditDate || e.date, this.mealEditEntryType || e.entryType, !0);
  }
  async confirmDeleteMeal(t) {
    if (!(!t.id || !window.confirm(`Remove ${t.title} from ${this.formatDialogDate(t.date)}?`)))
      try {
        await this.callFamilyMealie("family_mealie/mealplans/delete", { meal_id: t.id }), this.closeRecipeDialog(), await this.loadMealPlan();
      } catch (i) {
        this.error = b(i, "Could not remove meal.");
      }
  }
  async createShoppingList(t) {
    t.preventDefault();
    const e = this.newListName.trim();
    if (e)
      try {
        const i = await this.callFamilyMealie("family_mealie/shopping_lists/create", { name: e }), a = Z(i);
        this.newListName = "", await this.loadShoppingLists(), a && await this.selectShoppingList(a.id);
      } catch (i) {
        this.error = b(i, "Could not create grocery list.");
      }
  }
  async addShoppingItem(t) {
    t?.preventDefault();
    const e = this.selectedShoppingList, i = this.groceryText.trim();
    if (!e || !i) return;
    const a = {
      shoppingListId: e.id,
      checked: !1,
      position: e.items.length,
      quantity: 1,
      note: i,
      display: i,
      extras: {},
      recipeReferences: []
    };
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/create", { payload: a }), this.groceryText = "", await this.loadShoppingList(e.id);
    } catch (r) {
      this.error = b(r, "Could not add grocery item.");
    }
  }
  async toggleShoppingItem(t, e) {
    const i = dt(t, e);
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/update", { item_id: t.id, payload: i }), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
    } catch (a) {
      this.error = b(a, "Could not update grocery item.");
    }
  }
  async deleteShoppingItem(t, e) {
    t.preventDefault(), t.stopPropagation();
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/delete", { item_id: e.id }), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
    } catch (i) {
      this.error = b(i, "Could not remove grocery item.");
    }
  }
  async addRecipeToGroceries(t) {
    if (this.selectedShoppingListId)
      try {
        await this.callFamilyMealie("family_mealie/shopping_lists/add_recipe", {
          list_id: this.selectedShoppingListId,
          recipe_id: t,
          scale: 1
        }), await this.loadShoppingList(this.selectedShoppingListId), this.view = "groceries", this.closeRecipeDialog();
      } catch (e) {
        this.error = b(e, "Could not add ingredients to grocery list.");
      }
  }
  async callFamilyMealie(t, e = {}) {
    if (!this.hass) throw new Error("Home Assistant is not ready yet.");
    return this.hass.callWS({
      type: t,
      entry_id: this.config.entry_id,
      ...e
    });
  }
  openView(t) {
    this.view = t, t === "groceries" && !this.selectedShoppingList && this.selectedShoppingListId && this.loadShoppingList(this.selectedShoppingListId);
  }
  async shiftPlannerRange(t) {
    this.plannerOffsetDays += t, await this.reloadPlannerRange();
  }
  async reloadPlannerRange() {
    if (this.hass) {
      this.error = void 0;
      try {
        await this.loadMealPlan();
      } catch (t) {
        this.error = b(t, "Could not load meals for this week.");
      }
    }
  }
  clearManualRecipeForm() {
    this.manualRecipeName = "", this.manualRecipeSource = "", this.manualRecipeDescription = "", this.manualRecipeServings = "", this.manualRecipePrep = "", this.manualRecipeCook = "", this.manualRecipeTotal = "", this.manualRecipeIngredients = "", this.manualRecipeInstructions = "", this.manualParseIngredients = !0;
  }
  openAddDialog(t) {
    this.selectedSlot = t, this.selectedRecipe = void 0, this.search = "", this.noteText = "", this.addDialogOpen = !0;
  }
  async openMealDialog(t) {
    if (this.selectedMeal = t, this.selectedRecipeForDialog = void 0, this.recipeDetail = void 0, this.mealEditDate = t.date, this.mealEditEntryType = t.entryType, this.noteEditTitle = t.title, this.noteEditText = t.text ?? t.title, this.recipeDialogOpen = !0, t.recipeSlug) {
      this.recipeLoading = !0;
      try {
        this.recipeDetail = await this.fetchRecipeDetail(t);
      } catch (e) {
        this.error = b(e, "Could not load recipe details.");
      } finally {
        this.recipeLoading = !1;
      }
    }
  }
  async openRecipeSummaryDialog(t) {
    this.selectedMeal = void 0, this.selectedRecipeForDialog = t, this.recipeDetail = void 0, this.recipeDialogOpen = !0, this.recipeLoading = !0;
    try {
      this.recipeDetail = await this.fetchRecipeDetail(t);
    } catch (e) {
      this.error = b(e, "Could not load recipe details.");
    } finally {
      this.recipeLoading = !1;
    }
  }
  async selectShoppingList(t) {
    t && (this.selectedShoppingListId = t, await this.loadShoppingList(t));
  }
  chooseRecipe(t) {
    this.selectedRecipe = t, this.noteText = "";
  }
  chooseNote(t) {
    this.noteText = t, this.selectedRecipe = void 0;
  }
  onDateInput(t) {
    this.selectedSlot && (this.selectedSlot = { ...this.selectedSlot, date: y(t) });
  }
  onEntryTypeInput(t) {
    this.selectedSlot && (this.selectedSlot = { ...this.selectedSlot, entryType: this.canonicalEntryType(y(t)) });
  }
  mealPlacementChanged() {
    const t = this.selectedMeal;
    return t ? this.mealEditDate !== t.date || this.canonicalEntryType(this.mealEditEntryType) !== this.canonicalEntryType(t.entryType) : !1;
  }
  startMealPointer(t, e) {
    if (!e.id || t.button !== 0) return;
    const i = t.currentTarget;
    i.setPointerCapture?.(t.pointerId);
    const a = {
      mealId: String(e.id),
      pointerId: t.pointerId,
      startX: t.clientX,
      startY: t.clientY,
      active: !1,
      source: i,
      holdTimer: void 0
    };
    a.holdTimer = window.setTimeout(() => this.activateMealPointerDrag(a.pointerId), 450), this.pointerDrag = a;
  }
  activateMealPointerDrag(t) {
    const e = this.pointerDrag;
    !e || e.pointerId !== t || (e.active = !0, e.holdTimer = void 0, this.draggingMealId = e.mealId, this.classList.add("dragging-meal"), e.source.classList.add("dragging"));
  }
  onMealCardClick(t, e) {
    if (Date.now() < this.suppressMealClickUntil) {
      t.preventDefault(), t.stopPropagation();
      return;
    }
    this.openMealDialog(e);
  }
  async dropMeal(t, e, i) {
    if (!this.draggingMealId) return;
    t.preventDefault(), t.stopPropagation();
    const a = t.dataTransfer?.getData("text/plain") || this.draggingMealId, r = this.mealPlan.find((s) => String(s.id) === a);
    this.clearDraggingState(), r && await this.moveMeal(r, e, i ?? r.entryType);
  }
  dropTargetFromPoint(t, e) {
    const r = this.renderRoot.elementFromPoint?.(t, e)?.closest("[data-drop-date]"), s = r?.dataset.dropDate;
    if (s)
      return {
        date: s,
        entryType: r.dataset.dropEntryType
      };
  }
  clearDraggingState() {
    this.classList.remove("dragging-meal"), this.renderRoot.querySelectorAll(".meal-pill.dragging").forEach((t) => t.classList.remove("dragging")), this.draggingMealId = void 0;
  }
  async moveMeal(t, e, i, a = !1) {
    const r = this.canonicalEntryType(i);
    if (!t.id || !e || !r || t.date === e && this.canonicalEntryType(t.entryType) === r) return;
    const s = ve(t, { date: e, entryType: r });
    this.mealSaving = !0;
    try {
      await this.callFamilyMealie("family_mealie/mealplans/update", { meal_id: t.id, payload: s }), this.selectedMeal = this.selectedMeal?.id === t.id ? { ...t, date: e, entryType: r, raw: { ...t.raw, ...s } } : this.selectedMeal, await this.loadMealPlan(), a && this.closeRecipeDialog();
    } catch (n) {
      this.error = b(n, "Could not move meal.");
    } finally {
      this.mealSaving = !1;
    }
  }
  filteredRecipes() {
    const t = this.search.trim().toLocaleLowerCase();
    return t ? this.recipes.filter((e) => e.name.toLocaleLowerCase().includes(t)) : this.recipes;
  }
  selectedRecipeKey(t) {
    return t?.id ?? t?.slug ?? t?.name;
  }
  mealsFor(t, e) {
    const i = E(e);
    return this.mealPlan.filter((a) => a.date === t && E(a.entryType) === i);
  }
  hasMealsForDay(t) {
    return this.mealPlan.some((e) => e.date === t);
  }
  daysToShow() {
    const t = Math.max(1, Math.min(14, this.config.days ?? 7)), e = J(/* @__PURE__ */ new Date()), i = Q(yt(e, this.weekStartIndex()), this.plannerOffsetDays);
    return Array.from({ length: t }, (a, r) => Q(i, r));
  }
  rangeStepDays() {
    return Math.max(1, Math.min(14, this.config.days ?? 7));
  }
  entryTypes() {
    const t = this.config.entry_types?.map((e) => e.trim()).filter(Boolean) ?? [];
    return t.length ? t : B;
  }
  canonicalEntryType(t) {
    return Re(t, this.entryTypes());
  }
  weekStartIndex() {
    return vt(this.config.week_start);
  }
  dateRange() {
    const t = this.daysToShow();
    return [P(t[0]), P(t[t.length - 1])];
  }
  subtitle() {
    if (this.view === "recipes") return `${this.recipes.length} recipes`;
    if (this.view === "groceries") return this.selectedShoppingList?.name ?? "Grocery lists";
    const t = this.daysToShow();
    return `${this.formatMonthDay(t[0])} - ${this.formatMonthDay(t[t.length - 1])}`;
  }
  formatWeekday(t) {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { weekday: "short" }).format(t);
  }
  formatMonthDay(t) {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { month: "short", day: "numeric" }).format(t);
  }
  formatDialogDate(t) {
    return new Intl.DateTimeFormat(this.hass?.config?.language, { weekday: "long", month: "long", day: "numeric" }).format(ft(t));
  }
  restartRefreshTimer() {
    window.clearInterval(this.refreshTimer);
    const t = this.config.refresh_minutes ?? 15;
    t > 0 && (this.refreshTimer = window.setInterval(() => void this.refreshAll(), t * 60 * 1e3));
  }
  syncNativeDialogs() {
    const t = this.renderRoot.querySelector("dialog.add"), e = this.renderRoot.querySelector("dialog.recipe");
    this.addDialogOpen && t && !t.open && t.showModal(), this.recipeDialogOpen && e && !e.open && e.showModal();
  }
  syncNativeSelects() {
    const t = this.renderRoot.querySelector("dialog.add select.meal-type-select");
    t && this.selectedSlot && (t.value = this.canonicalEntryType(this.selectedSlot.entryType));
    const e = this.renderRoot.querySelector("dialog.recipe select.meal-type-select");
    e && this.selectedMeal && (e.value = this.canonicalEntryType(this.mealEditEntryType || this.selectedMeal.entryType));
  }
};
c.styles = ke`
    :host {
      display: block;
      color: var(--primary-text-color);
      --meal-card-radius: 8px;
      --meal-card-touch: 52px;
      --meal-card-surface: var(--card-background-color, #fff);
      --meal-card-muted: var(--secondary-text-color, #6b7280);
      --meal-card-line: var(--divider-color, rgba(0, 0, 0, 0.12));
      --meal-card-accent: var(--primary-color, #4f7f68);
      --meal-card-warning: var(--error-color, #b3261e);
    }

    ha-card {
      overflow: hidden;
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

    h2,
    h3,
    h4,
    p {
      margin: 0;
    }

    h2 {
      font-size: 28px;
      line-height: 1.1;
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

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    button {
      min-height: var(--meal-card-touch);
      border: 1px solid var(--meal-card-line);
      border-radius: var(--meal-card-radius);
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
      cursor: pointer;
    }

    button:disabled {
      cursor: progress;
      opacity: 0.65;
    }

    .primary {
      border-color: transparent;
      background: var(--meal-card-accent);
      color: var(--text-primary-color, #fff);
      font-weight: 800;
      padding: 0 18px;
    }

    .secondary {
      border-color: color-mix(in srgb, var(--meal-card-accent) 30%, var(--meal-card-line));
      background: color-mix(in srgb, var(--meal-card-accent) 10%, var(--meal-card-surface));
      color: var(--meal-card-accent);
      font-weight: 800;
      padding: 0 18px;
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
      border-radius: var(--meal-card-radius);
      background: color-mix(in srgb, var(--primary-background-color, #f6f6f6) 72%, var(--meal-card-surface));
    }

    .tabs button {
      min-height: 44px;
      border: 0;
      font-weight: 800;
      background: transparent;
    }

    .tabs button.active {
      background: var(--meal-card-surface);
      box-shadow: var(--ha-card-box-shadow, 0 1px 4px rgba(0, 0, 0, 0.16));
    }

    .notice {
      margin-top: 16px;
      padding: 12px 14px;
      border: 1px solid color-mix(in srgb, var(--meal-card-warning) 35%, transparent);
      border-radius: var(--meal-card-radius);
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
      border-radius: var(--meal-card-radius);
      background: color-mix(in srgb, var(--meal-card-surface) 90%, var(--primary-background-color, #f6f6f6));
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
      border-radius: var(--meal-card-radius);
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
      border-radius: var(--meal-card-radius);
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
      min-height: 40px;
      border: 0;
      padding: 0 12px;
      background: transparent;
      font-weight: 800;
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
      border-radius: var(--meal-card-radius);
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
      border-radius: var(--meal-card-radius);
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
      border-radius: var(--meal-card-radius);
      padding: 0 14px;
      background: var(--meal-card-surface);
      color: var(--primary-text-color);
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
        align-items: flex-start;
      }

      .top-actions {
        flex-wrap: wrap;
        justify-content: flex-end;
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
  Me({ attribute: !1 })
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
function De(t, e) {
  const i = $(t);
  if (!i) return;
  const a = o(i.name) ?? o(i.recipe_name) ?? o(i.title);
  if (!a) return;
  const r = o(i.slug) ?? o(i.recipe_slug), s = o(i.id) ?? o(i.recipe_id);
  return {
    id: s,
    slug: r,
    name: a,
    description: o(i.description),
    image: Ee(s, i, e),
    raw: i
  };
}
function st(t) {
  return "entryType" in t;
}
function nt(t, e) {
  const i = $(t), a = De(i, e);
  if (!(!i || !a))
    return {
      ...a,
      servings: o(i.recipe_yield) ?? o(i.servings) ?? o(i.recipeYield),
      prepTime: X(i.prep_time ?? i.prepTime),
      cookTime: X(i.cook_time ?? i.cookTime),
      totalTime: X(i.total_time ?? i.totalTime),
      ingredients: mt(i.recipe_ingredient ?? i.ingredients ?? i.recipeIngredient),
      instructions: gt(i.recipe_instructions ?? i.instructions ?? i.recipeInstructions)
    };
}
function ot(t, e, i = B) {
  const a = $(t);
  if (!a) return;
  const r = $(a.recipe), s = o(a.date) ?? o(a.mealplan_date) ?? o(a.mealplanDate), n = Re(
    o(a.entryType) ?? o(a.entry_type) ?? o(a.mealType) ?? o(a.meal_type) ?? "",
    i
  ), m = o(a.text) ?? o(a.note), h = o(a.title) || o(r?.name) || m || "Meal", f = o(a.recipeSlug) ?? o(a.recipe_slug) ?? o(r?.slug);
  if (!(!s || !n))
    return {
      id: a.id,
      date: s.slice(0, 10),
      entryType: n,
      title: h,
      text: m,
      recipeId: o(a.recipeId) ?? o(a.recipe_id) ?? o(r?.id),
      recipeSlug: f,
      image: Ee(o(a.recipeId) ?? o(a.recipe_id) ?? o(r?.id), r, e),
      raw: a
    };
}
function Z(t) {
  const e = $(t);
  if (!e) return;
  const i = o(e.id);
  if (!i) return;
  const a = o(e.name) ?? "Grocery List", r = M(e.listItems ?? e.list_items);
  return {
    id: i,
    name: a,
    itemCount: r.length || void 0,
    raw: e
  };
}
function lt(t) {
  const e = Z(t), i = $(t);
  if (!(!e || !i))
    return {
      ...e,
      items: M(i.listItems ?? i.list_items).map(ct).filter(Boolean)
    };
}
function ct(t) {
  const e = $(t);
  if (!e) return;
  const i = o(e.id), a = o(e.shoppingListId) ?? o(e.shopping_list_id);
  if (!(!i || !a))
    return {
      id: i,
      shoppingListId: a,
      title: pt(e),
      checked: !!e.checked,
      raw: e
    };
}
function pt(t) {
  const e = o(t.display);
  if (e) return e;
  const i = o(t.quantity), a = o($(t.unit)?.name) ?? o(t.unit), r = o($(t.food)?.name) ?? o(t.food), s = o(t.note);
  return [i && i !== "0" ? i : void 0, a, r, s].filter(Boolean).join(" ") || "Item";
}
function dt(t, e) {
  const i = t.raw;
  return ne({
    shoppingListId: t.shoppingListId,
    checked: e,
    position: i.position ?? 0,
    quantity: i.quantity ?? 1,
    food: i.food,
    unit: i.unit,
    note: i.note ?? "",
    display: i.display ?? t.title,
    foodId: i.foodId ?? i.food_id,
    labelId: i.labelId ?? i.label_id,
    unitId: i.unitId ?? i.unit_id,
    extras: i.extras ?? {},
    recipeReferences: i.recipeReferences ?? i.recipe_references ?? []
  });
}
function ve(t, e) {
  const i = t.raw, a = t.recipeId ?? i.recipeId ?? i.recipe_id ?? $(i.recipe)?.id;
  return ne({
    id: t.id ?? i.id,
    groupId: i.groupId ?? i.group_id,
    userId: i.userId ?? i.user_id,
    date: e.date ?? t.date,
    entryType: e.entryType ?? t.entryType,
    title: e.title ?? t.title,
    text: e.text ?? t.text ?? t.title,
    recipeId: a ?? null
  });
}
function ht(t) {
  const e = ut(t.servings), i = $e(t.ingredients), a = $e(t.instructions);
  return {
    name: t.name.trim(),
    ...ne({
      description: t.description.trim(),
      orgURL: t.source.trim(),
      recipeServings: e,
      recipeYield: e ? `${e} servings` : void 0,
      prepTime: G(t.prep),
      cookTime: G(t.cook),
      totalTime: G(t.total),
      recipeIngredient: i.length ? i.map((r) => ({
        note: r,
        display: r,
        originalText: r
      })) : void 0,
      recipeInstructions: a.length ? a.map((r) => ({
        title: "",
        summary: "",
        text: r,
        ingredientReferences: []
      })) : void 0,
      parseIngredients: t.parseIngredients,
      ingredientParser: t.ingredientParser
    })
  };
}
function $e(t) {
  return t.split(/\r?\n/).map((e) => e.trim()).filter(Boolean);
}
function ut(t) {
  const e = Number(t);
  return Number.isFinite(e) && e > 0 ? e : void 0;
}
function G(t) {
  const e = t.trim();
  if (e)
    return /^\d+$/.test(e) ? `${e} min` : e;
}
function mt(t) {
  return M(t).map((e) => {
    if (typeof e == "string") return e;
    const i = $(e);
    if (!i) return;
    const a = o(i.display);
    if (a) return a;
    const r = o(i.note), s = o($(i.food)?.name) ?? o(i.food), n = o(i.quantity), m = o($(i.unit)?.name) ?? o(i.unit);
    return [n && n !== "0" ? n : void 0, m, s, r].filter(Boolean).join(" ");
  }).filter((e) => !!e);
}
function gt(t) {
  return M(t).flatMap((e) => {
    if (typeof e == "string") return [be(e)];
    const i = $(e), a = o(i?.text) ?? o(i?.instruction) ?? o(i?.summary);
    return a ? [be(a)] : [];
  }).filter(Boolean);
}
function M(t) {
  if (Array.isArray(t)) return t;
  const e = $(t);
  if (!e) return [];
  const i = [e.items, e.data, e.results, e.recipe, e.recipes, e.mealplans, e.mealplan];
  for (const a of i)
    if (Array.isArray(a)) return a;
  return [];
}
function $(t) {
  if (!(!t || typeof t != "object" || Array.isArray(t)))
    return t;
}
function ne(t) {
  return Object.fromEntries(Object.entries(t).filter(([, e]) => e !== void 0 && e !== ""));
}
function Re(t, e) {
  const i = t.trim(), a = E(i);
  return e.find((s) => E(s) === a) ?? i.toLocaleLowerCase();
}
function E(t) {
  return t.trim().toLocaleLowerCase().replace(/[\s_-]+/g, "_");
}
function o(t) {
  if (!(t == null || t === ""))
    return String(t);
}
function Ee(t, e, i) {
  const a = o(e?.image) ?? o(e?.image_url) ?? o(e?.recipe_image);
  return a && /^https?:\/\//i.test(a) ? a : t && a && i ? `/api/family_mealie/recipe/${encodeURIComponent(t)}/image?token=${encodeURIComponent(i)}` : void 0;
}
function X(t) {
  const e = o(t);
  if (e)
    return /^\d+$/.test(e) ? `${e} min` : e.replace(/^PT/i, "").replace(/(\d+)H/i, "$1 hr ").replace(/(\d+)M/i, "$1 min").trim();
}
function be(t) {
  const e = document.createElement("div");
  return e.innerHTML = t, e.textContent?.trim() ?? t;
}
function y(t) {
  return t.currentTarget.value;
}
function J(t) {
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function Q(t, e) {
  const i = new Date(t);
  return i.setDate(i.getDate() + e), i;
}
function yt(t, e) {
  const i = J(t), a = (i.getDay() - e + 7) % 7;
  return Q(i, -a);
}
function P(t) {
  const e = t.getFullYear(), i = String(t.getMonth() + 1).padStart(2, "0"), a = String(t.getDate()).padStart(2, "0");
  return `${e}-${i}-${a}`;
}
function ft(t) {
  const [e, i, a] = t.split("-").map(Number);
  return new Date(e, i - 1, a);
}
function vt(t) {
  if (typeof t == "number" && Number.isInteger(t)) return (t % 7 + 7) % 7;
  const e = String(t ?? "sunday").trim().toLocaleLowerCase(), i = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"], a = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"], r = i.indexOf(e);
  if (r >= 0) return r;
  const s = a.indexOf(e);
  return s >= 0 ? s : 0;
}
function C(t) {
  return t.replace(/[_-]/g, " ").replace(/\b\w/g, (e) => e.toLocaleUpperCase());
}
function b(t, e) {
  return t instanceof Error ? t.message : typeof t == "object" && t && "message" in t ? String(t.message) : e;
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

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, Z = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, J = Symbol(), ie = /* @__PURE__ */ new WeakMap();
let me = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== J) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (Z && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = ie.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && ie.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Se = (t) => new me(typeof t == "string" ? t : t + "", void 0, J), Ae = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, r, a) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[a + 1], t[0]);
  return new me(i, t, J);
}, Te = (t, e) => {
  if (Z) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), r = j.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, t.appendChild(s);
  }
}, se = Z ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return Se(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: De, defineProperty: Ee, getOwnPropertyDescriptor: Me, getOwnPropertyNames: ke, getOwnPropertySymbols: Le, getPrototypeOf: Ce } = Object, q = globalThis, re = q.trustedTypes, Re = re ? re.emptyScript : "", Ie = q.reactiveElementPolyfillSupport, R = (t, e) => t, F = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Re : null;
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
} }, Q = (t, e) => !De(t, e), ae = { attribute: !0, type: String, converter: F, reflect: !1, useDefault: !1, hasChanged: Q };
Symbol.metadata ??= Symbol("metadata"), q.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let E = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = ae) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, i);
      r !== void 0 && Ee(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: r, set: a } = Me(this.prototype, e) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: r, set(o) {
      const p = r?.call(this);
      a?.call(this, o), this.requestUpdate(e, p, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ae;
  }
  static _$Ei() {
    if (this.hasOwnProperty(R("elementProperties"))) return;
    const e = Ce(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(R("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(R("properties"))) {
      const i = this.properties, s = [...ke(i), ...Le(i)];
      for (const r of s) this.createProperty(r, i[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0) for (const [s, r] of i) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const r = this._$Eu(i, s);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) i.unshift(se(r));
    } else e !== void 0 && i.push(se(e));
    return i;
  }
  static _$Eu(e, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const s of i.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Te(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, i, s) {
    this._$AK(e, s);
  }
  _$ET(e, i) {
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const a = (s.converter?.toAttribute !== void 0 ? s.converter : F).toAttribute(i, s.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, i) {
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = s.getPropertyOptions(r), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : F;
      this._$Em = r;
      const p = o.fromAttribute(i, a.type);
      this[r] = p ?? this._$Ej?.get(r) ?? p, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, r = !1, a) {
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (a = this[e]), s ??= o.getPropertyOptions(e), !((s.hasChanged ?? Q)(a, i) || s.useDefault && s.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, s)))) return;
      this.C(e, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: s, reflect: r, wrapped: a }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? i ?? this[e]), a !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (i = void 0), this._$AL.set(e, i)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [r, a] of this._$Ep) this[r] = a;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, a] of s) {
        const { wrapped: o } = a, p = this[r];
        o !== !0 || this._$AL.has(r) || p === void 0 || this.C(r, void 0, a, p);
      }
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
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
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[R("elementProperties")] = /* @__PURE__ */ new Map(), E[R("finalized")] = /* @__PURE__ */ new Map(), Ie?.({ ReactiveElement: E }), (q.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = globalThis, oe = (t) => t, B = X.trustedTypes, ne = B ? B.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, fe = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, ye = "?" + w, Pe = `<${ye}>`, D = document, P = () => D.createComment(""), O = (t) => t === null || typeof t != "object" && typeof t != "function", ee = Array.isArray, Oe = (t) => ee(t) || typeof t?.[Symbol.iterator] == "function", W = `[ 	
\f\r]`, L = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, le = /-->/g, ce = />/g, S = RegExp(`>|${W}(?:([^\\s"'>=/]+)(${W}*=${W}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), de = /'/g, pe = /"/g, $e = /^(?:script|style|textarea|title)$/i, Ne = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), l = Ne(1), M = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), he = /* @__PURE__ */ new WeakMap(), A = D.createTreeWalker(D, 129);
function ve(t, e) {
  if (!ee(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ne !== void 0 ? ne.createHTML(e) : e;
}
const Ue = (t, e) => {
  const i = t.length - 1, s = [];
  let r, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = L;
  for (let p = 0; p < i; p++) {
    const c = t[p];
    let f, y, m = -1, x = 0;
    for (; x < c.length && (o.lastIndex = x, y = o.exec(c), y !== null); ) x = o.lastIndex, o === L ? y[1] === "!--" ? o = le : y[1] !== void 0 ? o = ce : y[2] !== void 0 ? ($e.test(y[2]) && (r = RegExp("</" + y[2], "g")), o = S) : y[3] !== void 0 && (o = S) : o === S ? y[0] === ">" ? (o = r ?? L, m = -1) : y[1] === void 0 ? m = -2 : (m = o.lastIndex - y[2].length, f = y[1], o = y[3] === void 0 ? S : y[3] === '"' ? pe : de) : o === pe || o === de ? o = S : o === le || o === ce ? o = L : (o = S, r = void 0);
    const _ = o === S && t[p + 1].startsWith("/>") ? " " : "";
    a += o === L ? c + Pe : m >= 0 ? (s.push(f), c.slice(0, m) + fe + c.slice(m) + w + _) : c + w + (m === -2 ? p : _);
  }
  return [ve(t, a + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class N {
  constructor({ strings: e, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let a = 0, o = 0;
    const p = e.length - 1, c = this.parts, [f, y] = Ue(e, i);
    if (this.el = N.createElement(f, s), A.currentNode = this.el.content, i === 2 || i === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (r = A.nextNode()) !== null && c.length < p; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const m of r.getAttributeNames()) if (m.endsWith(fe)) {
          const x = y[o++], _ = r.getAttribute(m).split(w), z = /([.?@])?(.*)/.exec(x);
          c.push({ type: 1, index: a, name: z[2], strings: _, ctor: z[1] === "." ? He : z[1] === "?" ? je : z[1] === "@" ? Fe : V }), r.removeAttribute(m);
        } else m.startsWith(w) && (c.push({ type: 6, index: a }), r.removeAttribute(m));
        if ($e.test(r.tagName)) {
          const m = r.textContent.split(w), x = m.length - 1;
          if (x > 0) {
            r.textContent = B ? B.emptyScript : "";
            for (let _ = 0; _ < x; _++) r.append(m[_], P()), A.nextNode(), c.push({ type: 2, index: ++a });
            r.append(m[x], P());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ye) c.push({ type: 2, index: a });
      else {
        let m = -1;
        for (; (m = r.data.indexOf(w, m + 1)) !== -1; ) c.push({ type: 7, index: a }), m += w.length - 1;
      }
      a++;
    }
  }
  static createElement(e, i) {
    const s = D.createElement("template");
    return s.innerHTML = e, s;
  }
}
function k(t, e, i = t, s) {
  if (e === M) return e;
  let r = s !== void 0 ? i._$Co?.[s] : i._$Cl;
  const a = O(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== a && (r?._$AO?.(!1), a === void 0 ? r = void 0 : (r = new a(t), r._$AT(t, i, s)), s !== void 0 ? (i._$Co ??= [])[s] = r : i._$Cl = r), r !== void 0 && (e = k(t, r._$AS(t, e.values), r, s)), e;
}
class ze {
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
    const { el: { content: i }, parts: s } = this._$AD, r = (e?.creationScope ?? D).importNode(i, !0);
    A.currentNode = r;
    let a = A.nextNode(), o = 0, p = 0, c = s[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let f;
        c.type === 2 ? f = new U(a, a.nextSibling, this, e) : c.type === 1 ? f = new c.ctor(a, c.name, c.strings, this, e) : c.type === 6 && (f = new Be(a, this, e)), this._$AV.push(f), c = s[++p];
      }
      o !== c?.index && (a = A.nextNode(), o++);
    }
    return A.currentNode = D, r;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class U {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, i, s, r) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = k(this, e, i), O(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== M && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Oe(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(D.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: i, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = N.createElement(ve(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const a = new ze(r, this), o = a.u(this.options);
      a.p(i), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let i = he.get(e.strings);
    return i === void 0 && he.set(e.strings, i = new N(e)), i;
  }
  k(e) {
    ee(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const a of e) r === i.length ? i.push(s = new U(this.O(P()), this.O(P()), this, this.options)) : s = i[r], s._$AI(a), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); e !== this._$AB; ) {
      const s = oe(e).nextSibling;
      oe(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class V {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, r, a) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = i, this._$AM = r, this.options = a, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = d;
  }
  _$AI(e, i = this, s, r) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) e = k(this, e, i, 0), o = !O(e) || e !== this._$AH && e !== M, o && (this._$AH = e);
    else {
      const p = e;
      let c, f;
      for (e = a[0], c = 0; c < a.length - 1; c++) f = k(this, p[s + c], i, c), f === M && (f = this._$AH[c]), o ||= !O(f) || f !== this._$AH[c], f === d ? e = d : e !== d && (e += (f ?? "") + a[c + 1]), this._$AH[c] = f;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class He extends V {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class je extends V {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class Fe extends V {
  constructor(e, i, s, r, a) {
    super(e, i, s, r, a), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = k(this, e, i, 0) ?? d) === M) return;
    const s = this._$AH, r = e === d && s !== d || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, a = e !== d && (s === d || r);
    r && this.element.removeEventListener(this.name, this, s), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Be {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    k(this, e);
  }
}
const qe = X.litHtmlPolyfillSupport;
qe?.(N, U), (X.litHtmlVersions ??= []).push("3.3.3");
const Ve = (t, e, i) => {
  const s = i?.renderBefore ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const a = i?.renderBefore ?? null;
    s._$litPart$ = r = new U(e.insertBefore(P(), a), a, void 0, i ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis;
class I extends E {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ve(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return M;
  }
}
I._$litElement$ = !0, I.finalized = !0, te.litElementHydrateSupport?.({ LitElement: I });
const We = te.litElementPolyfillSupport;
We?.({ LitElement: I });
(te.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ge = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ke = { attribute: !0, type: String, converter: F, reflect: !1, hasChanged: Q }, Ye = (t = Ke, e, i) => {
  const { kind: s, metadata: r } = i;
  let a = globalThis.litPropertyMetadata.get(r);
  if (a === void 0 && globalThis.litPropertyMetadata.set(r, a = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), a.set(i.name, t), s === "accessor") {
    const { name: o } = i;
    return { set(p) {
      const c = e.get.call(this);
      e.set.call(this, p), this.requestUpdate(o, c, t, !0, p);
    }, init(p) {
      return p !== void 0 && this.C(o, void 0, t, p), p;
    } };
  }
  if (s === "setter") {
    const { name: o } = i;
    return function(p) {
      const c = this[o];
      e.call(this, p), this.requestUpdate(o, c, t, !0, p);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function be(t) {
  return (e, i) => typeof i == "object" ? Ye(t, e, i) : ((s, r, a) => {
    const o = r.hasOwnProperty(a);
    return r.constructor.createProperty(a, s), o ? Object.getOwnPropertyDescriptor(r, a) : void 0;
  })(t, e, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function g(t) {
  return be({ ...t, state: !0, attribute: !1 });
}
var Ze = Object.defineProperty, Je = Object.getOwnPropertyDescriptor, u = (t, e, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Je(e, i) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (r = (s ? o(e, i, r) : o(r)) || r);
  return s && r && Ze(e, i, r), r;
};
const G = ["breakfast", "lunch", "dinner"], Qe = ["Leftovers", "Eat Out", "Freezer Meal"];
let h = class extends I {
  constructor() {
    super(...arguments), this.config = { type: "custom:family-mealie-planner-card" }, this.view = "planner", this.recipes = [], this.mealPlan = [], this.shoppingLists = [], this.loading = !1, this.addDialogOpen = !1, this.recipeDialogOpen = !1, this.recipeLoading = !1, this.search = "", this.noteText = "", this.noteEditTitle = "", this.noteEditText = "", this.noteSaving = !1, this.groceryText = "", this.newListName = "", this.openDefaultAddDialog = () => {
      const t = this.daysToShow()[0] ?? ge(/* @__PURE__ */ new Date()), e = this.entryTypes()[0] ?? G[0];
      this.openAddDialog({ date: C(t), entryType: e });
    }, this.closeAddDialog = () => {
      this.addDialogOpen = !1;
    }, this.closeRecipeDialog = () => {
      this.recipeDialogOpen = !1;
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
      entry_types: G,
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
    t.has("hass") && this.hass && this.recipes.length === 0 && this.mealPlan.length === 0 && this.refreshAll(), (t.has("addDialogOpen") || t.has("recipeDialogOpen")) && this.syncNativeDialogs();
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
              ${this.view === "planner" ? l`<button class="secondary action" @click=${this.openDefaultAddDialog}>Add meal</button>` : d}
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

          ${this.error ? l`<div class="notice">${this.error}</div>` : d}
          ${this.view === "planner" ? this.renderPlanner() : d}
          ${this.view === "recipes" ? this.renderRecipes() : d}
          ${this.view === "groceries" ? this.renderGroceries() : d}
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
      <div class="board" style=${`--day-count:${t.length}`}>
        ${t.map((e) => this.renderDay(e))}
      </div>
    `;
  }
  renderDay(t) {
    const e = C(t), i = this.hasMealsForDay(e);
    return l`
      <article class="day">
        <div class="day-head">
          <span>${this.formatWeekday(t)}</span>
          <strong>${this.formatMonthDay(t)}</strong>
        </div>
        <div class="meal-sections">
          ${i ? this.entryTypes().map((s) => this.renderMealSection(t, s)) : l`<div class="empty-day">No meals planned</div>`}
        </div>
      </article>
    `;
  }
  renderMealSection(t, e) {
    const i = C(t), s = this.mealsFor(i, e);
    return s.length ? l`
      <section class="meal-section">
        <header>
          <span>${H(e)}</span>
        </header>
        <div class="meal-list">
          ${s.map((r) => this.renderMealCard(r))}
        </div>
      </section>
    ` : d;
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
      <button class="meal-pill" @click=${() => this.openMealDialog(t)}>
        <strong>${t.title}</strong>
        ${t.text && t.text !== t.title ? l`<small>${t.text}</small>` : d}
      </button>
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
            @input=${(e) => this.search = b(e)}
          />
        </label>
      </div>

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
            @input=${(t) => this.newListName = b(t)}
          />
          <div class="list-buttons">
            ${this.shoppingLists.map(
      (t) => l`
                <button
                  class=${this.selectedShoppingListId === t.id ? "selected" : ""}
                  @click=${() => this.selectShoppingList(t.id)}
                >
                  <span>${t.name}</span>
                  ${t.itemCount !== void 0 ? l`<small>${t.itemCount}</small>` : d}
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
                    @input=${(t) => this.groceryText = b(t)}
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
    if (!this.addDialogOpen || !this.selectedSlot) return d;
    const t = this.filteredRecipes().slice(0, 36);
    return l`
      <dialog class="dialog add" @cancel=${this.closeAddDialog}>
        <form method="dialog" class="dialog-panel">
          <header>
            <div>
              <span>Add meal</span>
              <h3>${H(this.selectedSlot.entryType)} · ${this.formatDialogDate(this.selectedSlot.date)}</h3>
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
              <select .value=${this.selectedSlot.entryType} @change=${this.onEntryTypeInput}>
                ${this.entryTypes().map((e) => l`<option .value=${e}>${H(e)}</option>`)}
              </select>
            </label>
          </div>

          <label>
            Search recipes
            <input
              type="search"
              placeholder="Pasta, tacos, soup..."
              .value=${this.search}
              @input=${(e) => this.search = b(e)}
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
              ${Qe.map(
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
      this.noteText = b(e), this.noteText && (this.selectedRecipe = void 0);
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
    if (!this.recipeDialogOpen || !this.selectedMeal && !this.selectedRecipeForDialog) return d;
    const t = this.recipeDetail, e = this.selectedMeal?.title ?? this.selectedRecipeForDialog?.name ?? "Recipe", i = this.selectedMeal?.entryType, s = !!(this.selectedMeal && !this.selectedMeal.recipeSlug && !this.selectedMeal.recipeId);
    return l`
      <dialog class="dialog recipe" @cancel=${this.closeRecipeDialog}>
        <article class="dialog-panel cook-panel">
          <header>
            <div>
              <span>${i ? H(i) : "Recipe"}</span>
              <h3>${e}</h3>
            </div>
            <button type="button" class="plain" @click=${this.closeRecipeDialog}>Close</button>
          </header>

          ${this.recipeLoading ? l`<div class="loading">Loading recipe...</div>` : s ? this.renderNoteEditor() : l`
                ${t?.image || this.selectedMeal?.image ? l`<img class="hero-image" src=${t?.image ?? this.selectedMeal?.image ?? ""} alt="" />` : d}

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
                    ` : this.selectedMeal?.text ? l`<section class="cook-section note"><p>${this.selectedMeal.text}</p></section>` : d}

                ${t?.instructions.length ? l`
                      <section class="cook-section">
                        <h4>Instructions</h4>
                        <ol>
                          ${t.instructions.map((r) => l`<li>${r}</li>`)}
                        </ol>
                      </section>
                    ` : d}
              `}

          <footer class="recipe-actions">
            ${s ? l`
                  <button class="primary" @click=${this.saveNoteMeal} ?disabled=${this.noteSaving || !this.noteEditTitle.trim()}>
                    ${this.noteSaving ? "Saving" : "Save note"}
                  </button>
                ` : d}
            ${!s && t?.id && this.shoppingLists.length ? l`
                  <select .value=${this.selectedShoppingListId ?? ""} @change=${(r) => this.selectShoppingList(b(r))}>
                    ${this.shoppingLists.map((r) => l`<option .value=${r.id}>${r.name}</option>`)}
                  </select>
                  <button class="primary" @click=${() => t?.id && this.addRecipeToGroceries(t.id)}>
                    Add ingredients
                  </button>
                ` : d}
            ${this.selectedMeal ? l`<button class="danger" @click=${() => this.selectedMeal && this.confirmDeleteMeal(this.selectedMeal)}>Remove meal</button>` : d}
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
            @input=${(t) => this.noteEditTitle = b(t)}
          />
        </label>
        <label>
          Note
          <textarea
            .value=${this.noteEditText}
            @input=${(t) => this.noteEditText = b(t)}
          ></textarea>
        </label>
      </section>
    `;
  }
  stat(t, e) {
    return e ? l`<div><span>${t}</span><strong>${e}</strong></div>` : d;
  }
  async refreshAll() {
    if (!(!this.hass || this.loading)) {
      this.loading = !0, this.error = void 0;
      try {
        await this.loadInfo(), await Promise.all([this.loadRecipes(), this.loadMealPlan(), this.loadShoppingLists()]);
      } catch (t) {
        this.error = v(t, "Could not load Mealie data through Home Assistant.");
      } finally {
        this.loading = !1;
      }
    }
  }
  async loadInfo() {
    const t = await this.callFamilyMealie("family_mealie/info"), e = $(t);
    this.imageToken = n(e?.image_token) ?? n(e?.imageToken);
  }
  async loadRecipes() {
    const t = await this.callFamilyMealie("family_mealie/recipes", {
      limit: this.config.result_limit ?? 300
    });
    this.recipes = T(t).map((e) => xe(e, this.imageToken)).filter(Boolean);
  }
  async loadMealPlan() {
    const [t, e] = this.dateRange(), i = await this.callFamilyMealie("family_mealie/mealplans", {
      start_date: t,
      end_date: e,
      limit: -1
    });
    this.mealPlan = T(i).map((s) => tt(s, this.imageToken)).filter(Boolean);
  }
  async loadShoppingLists() {
    const t = await this.callFamilyMealie("family_mealie/shopping_lists", { limit: -1 }), e = T(t).map(Y).filter(Boolean);
    this.shoppingLists = e, !this.selectedShoppingListId && e.length && (this.selectedShoppingListId = e[0].id), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
  }
  async loadShoppingList(t) {
    const e = await this.callFamilyMealie("family_mealie/shopping_list", { list_id: t }), i = it(e);
    i && (this.selectedShoppingList = i, this.selectedShoppingListId = i.id);
  }
  async fetchRecipeDetail(t) {
    const e = Xe(t) ? t.recipeSlug : t.slug;
    if (!e) return;
    const i = await this.callFamilyMealie("family_mealie/recipe", { slug: e });
    return et(i, this.imageToken);
  }
  async addMeal(t) {
    if (t.preventDefault(), !this.selectedSlot) return;
    const e = this.selectedRecipe, i = this.noteText.trim(), s = {
      date: this.selectedSlot.date,
      entryType: this.selectedSlot.entryType,
      title: "",
      text: ""
    };
    e?.id ? s.recipeId = e.id : i && (s.title = i, s.text = i);
    try {
      await this.callFamilyMealie("family_mealie/mealplans/create", { payload: s }), this.closeAddDialog(), await this.loadMealPlan();
    } catch (r) {
      this.error = v(r, "Could not add meal.");
    }
  }
  async saveNoteMeal(t) {
    t.preventDefault();
    const e = this.selectedMeal;
    if (!e?.id) return;
    const i = this.noteEditTitle.trim();
    if (!i) return;
    const s = this.noteEditText.trim() || i, r = ot(e, i, s);
    this.noteSaving = !0;
    try {
      await this.callFamilyMealie("family_mealie/mealplans/update", { meal_id: e.id, payload: r }), this.selectedMeal = { ...e, title: i, text: s, raw: { ...e.raw, title: i, text: s } }, await this.loadMealPlan(), this.closeRecipeDialog();
    } catch (a) {
      this.error = v(a, "Could not save meal note.");
    } finally {
      this.noteSaving = !1;
    }
  }
  async confirmDeleteMeal(t) {
    if (!(!t.id || !window.confirm(`Remove ${t.title} from ${this.formatDialogDate(t.date)}?`)))
      try {
        await this.callFamilyMealie("family_mealie/mealplans/delete", { meal_id: t.id }), this.closeRecipeDialog(), await this.loadMealPlan();
      } catch (i) {
        this.error = v(i, "Could not remove meal.");
      }
  }
  async createShoppingList(t) {
    t.preventDefault();
    const e = this.newListName.trim();
    if (e)
      try {
        const i = await this.callFamilyMealie("family_mealie/shopping_lists/create", { name: e }), s = Y(i);
        this.newListName = "", await this.loadShoppingLists(), s && await this.selectShoppingList(s.id);
      } catch (i) {
        this.error = v(i, "Could not create grocery list.");
      }
  }
  async addShoppingItem(t) {
    t?.preventDefault();
    const e = this.selectedShoppingList, i = this.groceryText.trim();
    if (!e || !i) return;
    const s = {
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
      await this.callFamilyMealie("family_mealie/shopping_items/create", { payload: s }), this.groceryText = "", await this.loadShoppingList(e.id);
    } catch (r) {
      this.error = v(r, "Could not add grocery item.");
    }
  }
  async toggleShoppingItem(t, e) {
    const i = at(t, e);
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/update", { item_id: t.id, payload: i }), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
    } catch (s) {
      this.error = v(s, "Could not update grocery item.");
    }
  }
  async deleteShoppingItem(t, e) {
    t.preventDefault(), t.stopPropagation();
    try {
      await this.callFamilyMealie("family_mealie/shopping_items/delete", { item_id: e.id }), this.selectedShoppingListId && await this.loadShoppingList(this.selectedShoppingListId);
    } catch (i) {
      this.error = v(i, "Could not remove grocery item.");
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
        this.error = v(e, "Could not add ingredients to grocery list.");
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
  openAddDialog(t) {
    this.selectedSlot = t, this.selectedRecipe = void 0, this.search = "", this.noteText = "", this.addDialogOpen = !0;
  }
  async openMealDialog(t) {
    if (this.selectedMeal = t, this.selectedRecipeForDialog = void 0, this.recipeDetail = void 0, this.noteEditTitle = t.title, this.noteEditText = t.text ?? t.title, this.recipeDialogOpen = !0, t.recipeSlug) {
      this.recipeLoading = !0;
      try {
        this.recipeDetail = await this.fetchRecipeDetail(t);
      } catch (e) {
        this.error = v(e, "Could not load recipe details.");
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
      this.error = v(e, "Could not load recipe details.");
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
    this.selectedSlot && (this.selectedSlot = { ...this.selectedSlot, date: b(t) });
  }
  onEntryTypeInput(t) {
    this.selectedSlot && (this.selectedSlot = { ...this.selectedSlot, entryType: b(t) });
  }
  filteredRecipes() {
    const t = this.search.trim().toLocaleLowerCase();
    return t ? this.recipes.filter((e) => e.name.toLocaleLowerCase().includes(t)) : this.recipes;
  }
  selectedRecipeKey(t) {
    return t?.id ?? t?.slug ?? t?.name;
  }
  mealsFor(t, e) {
    return this.mealPlan.filter((i) => i.date === t && i.entryType.toLocaleLowerCase() === e.toLocaleLowerCase());
  }
  hasMealsForDay(t) {
    return this.mealPlan.some((e) => e.date === t);
  }
  daysToShow() {
    const t = Math.max(1, Math.min(14, this.config.days ?? 7)), e = ge(/* @__PURE__ */ new Date());
    return Array.from({ length: t }, (i, s) => ct(e, s));
  }
  entryTypes() {
    return this.config.entry_types?.length ? this.config.entry_types : G;
  }
  dateRange() {
    const t = this.daysToShow();
    return [C(t[0]), C(t[t.length - 1])];
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
    return new Intl.DateTimeFormat(this.hass?.config?.language, { weekday: "long", month: "long", day: "numeric" }).format(dt(t));
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
};
h.styles = Ae`
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

    .recipe-toolbar {
      margin-top: 18px;
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
      .stats,
      .grocery-layout {
        grid-template-columns: 1fr;
      }
    }
  `;
u([
  be({ attribute: !1 })
], h.prototype, "hass", 2);
u([
  g()
], h.prototype, "config", 2);
u([
  g()
], h.prototype, "view", 2);
u([
  g()
], h.prototype, "recipes", 2);
u([
  g()
], h.prototype, "mealPlan", 2);
u([
  g()
], h.prototype, "shoppingLists", 2);
u([
  g()
], h.prototype, "selectedShoppingList", 2);
u([
  g()
], h.prototype, "selectedShoppingListId", 2);
u([
  g()
], h.prototype, "imageToken", 2);
u([
  g()
], h.prototype, "loading", 2);
u([
  g()
], h.prototype, "error", 2);
u([
  g()
], h.prototype, "addDialogOpen", 2);
u([
  g()
], h.prototype, "recipeDialogOpen", 2);
u([
  g()
], h.prototype, "selectedSlot", 2);
u([
  g()
], h.prototype, "selectedMeal", 2);
u([
  g()
], h.prototype, "selectedRecipeForDialog", 2);
u([
  g()
], h.prototype, "recipeDetail", 2);
u([
  g()
], h.prototype, "recipeLoading", 2);
u([
  g()
], h.prototype, "search", 2);
u([
  g()
], h.prototype, "noteText", 2);
u([
  g()
], h.prototype, "noteEditTitle", 2);
u([
  g()
], h.prototype, "noteEditText", 2);
u([
  g()
], h.prototype, "noteSaving", 2);
u([
  g()
], h.prototype, "selectedRecipe", 2);
u([
  g()
], h.prototype, "groceryText", 2);
u([
  g()
], h.prototype, "newListName", 2);
h = u([
  Ge("family-mealie-planner-card")
], h);
function xe(t, e) {
  const i = $(t);
  if (!i) return;
  const s = n(i.name) ?? n(i.recipe_name) ?? n(i.title);
  if (!s) return;
  const r = n(i.slug) ?? n(i.recipe_slug), a = n(i.id) ?? n(i.recipe_id);
  return {
    id: a,
    slug: r,
    name: s,
    description: n(i.description),
    image: we(a, i, e),
    raw: i
  };
}
function Xe(t) {
  return "entryType" in t;
}
function et(t, e) {
  const i = $(t), s = xe(i, e);
  if (!(!i || !s))
    return {
      ...s,
      servings: n(i.recipe_yield) ?? n(i.servings) ?? n(i.recipeYield),
      prepTime: K(i.prep_time ?? i.prepTime),
      cookTime: K(i.cook_time ?? i.cookTime),
      totalTime: K(i.total_time ?? i.totalTime),
      ingredients: nt(i.recipe_ingredient ?? i.ingredients ?? i.recipeIngredient),
      instructions: lt(i.recipe_instructions ?? i.instructions ?? i.recipeInstructions)
    };
}
function tt(t, e) {
  const i = $(t);
  if (!i) return;
  const s = $(i.recipe), r = n(i.date) ?? n(i.mealplan_date) ?? n(i.mealplanDate), a = n(i.entryType) ?? n(i.entry_type) ?? n(i.mealType) ?? n(i.meal_type), o = n(i.text) ?? n(i.note), p = n(i.title) || n(s?.name) || o || "Meal", c = n(i.recipeSlug) ?? n(i.recipe_slug) ?? n(s?.slug);
  if (!(!r || !a))
    return {
      id: i.id,
      date: r.slice(0, 10),
      entryType: a,
      title: p,
      text: o,
      recipeId: n(i.recipeId) ?? n(i.recipe_id) ?? n(s?.id),
      recipeSlug: c,
      image: we(n(i.recipeId) ?? n(i.recipe_id) ?? n(s?.id), s, e),
      raw: i
    };
}
function Y(t) {
  const e = $(t);
  if (!e) return;
  const i = n(e.id);
  if (!i) return;
  const s = n(e.name) ?? "Grocery List", r = T(e.listItems ?? e.list_items);
  return {
    id: i,
    name: s,
    itemCount: r.length || void 0,
    raw: e
  };
}
function it(t) {
  const e = Y(t), i = $(t);
  if (!(!e || !i))
    return {
      ...e,
      items: T(i.listItems ?? i.list_items).map(st).filter(Boolean)
    };
}
function st(t) {
  const e = $(t);
  if (!e) return;
  const i = n(e.id), s = n(e.shoppingListId) ?? n(e.shopping_list_id);
  if (!(!i || !s))
    return {
      id: i,
      shoppingListId: s,
      title: rt(e),
      checked: !!e.checked,
      raw: e
    };
}
function rt(t) {
  const e = n(t.display);
  if (e) return e;
  const i = n(t.quantity), s = n($(t.unit)?.name) ?? n(t.unit), r = n($(t.food)?.name) ?? n(t.food), a = n(t.note);
  return [i && i !== "0" ? i : void 0, s, r, a].filter(Boolean).join(" ") || "Item";
}
function at(t, e) {
  const i = t.raw;
  return _e({
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
function ot(t, e, i) {
  return _e({
    date: t.date,
    entryType: t.entryType,
    title: e,
    text: i,
    recipeId: t.raw.recipeId ?? t.raw.recipe_id ?? null
  });
}
function nt(t) {
  return T(t).map((e) => {
    if (typeof e == "string") return e;
    const i = $(e);
    if (!i) return;
    const s = n(i.display);
    if (s) return s;
    const r = n(i.note), a = n($(i.food)?.name) ?? n(i.food), o = n(i.quantity), p = n($(i.unit)?.name) ?? n(i.unit);
    return [o && o !== "0" ? o : void 0, p, a, r].filter(Boolean).join(" ");
  }).filter((e) => !!e);
}
function lt(t) {
  return T(t).flatMap((e) => {
    if (typeof e == "string") return [ue(e)];
    const i = $(e), s = n(i?.text) ?? n(i?.instruction) ?? n(i?.summary);
    return s ? [ue(s)] : [];
  }).filter(Boolean);
}
function T(t) {
  if (Array.isArray(t)) return t;
  const e = $(t);
  if (!e) return [];
  const i = [e.items, e.data, e.results, e.recipe, e.recipes, e.mealplans, e.mealplan];
  for (const s of i)
    if (Array.isArray(s)) return s;
  return [];
}
function $(t) {
  if (!(!t || typeof t != "object" || Array.isArray(t)))
    return t;
}
function _e(t) {
  return Object.fromEntries(Object.entries(t).filter(([, e]) => e !== void 0 && e !== ""));
}
function n(t) {
  if (!(t == null || t === ""))
    return String(t);
}
function we(t, e, i) {
  const s = n(e?.image) ?? n(e?.image_url) ?? n(e?.recipe_image);
  return s && /^https?:\/\//i.test(s) ? s : t && s && i ? `/api/family_mealie/recipe/${encodeURIComponent(t)}/image?token=${encodeURIComponent(i)}` : void 0;
}
function K(t) {
  const e = n(t);
  if (e)
    return /^\d+$/.test(e) ? `${e} min` : e.replace(/^PT/i, "").replace(/(\d+)H/i, "$1 hr ").replace(/(\d+)M/i, "$1 min").trim();
}
function ue(t) {
  const e = document.createElement("div");
  return e.innerHTML = t, e.textContent?.trim() ?? t;
}
function b(t) {
  return t.currentTarget.value;
}
function ge(t) {
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function ct(t, e) {
  const i = new Date(t);
  return i.setDate(i.getDate() + e), i;
}
function C(t) {
  const e = t.getFullYear(), i = String(t.getMonth() + 1).padStart(2, "0"), s = String(t.getDate()).padStart(2, "0");
  return `${e}-${i}-${s}`;
}
function dt(t) {
  const [e, i, s] = t.split("-").map(Number);
  return new Date(e, i - 1, s);
}
function H(t) {
  return t.replace(/[_-]/g, " ").replace(/\b\w/g, (e) => e.toLocaleUpperCase());
}
function v(t, e) {
  return t instanceof Error ? t.message : typeof t == "object" && t && "message" in t ? String(t.message) : e;
}
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "family-mealie-planner-card",
  name: "Family Mealie Planner",
  description: "Kitchen-tablet meal planning for Mealie through a Home Assistant backend bridge."
});
export {
  h as FamilyMealiePlannerCard
};
//# sourceMappingURL=family-mealie-planner-card.js.map

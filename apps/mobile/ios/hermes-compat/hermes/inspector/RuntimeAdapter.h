/**
 * Compatibility shim for hermes/inspector/RuntimeAdapter.h
 *
 * Removed in Hermes ≥ build 250829xxx (replaced by hermes/cdp/).
 * Registration.h uses `RuntimeAdapter` bare inside
 *   namespace facebook::hermes::inspector_modern::chrome
 * which means the type must be found via argument-dependent lookup or
 * a using-declaration in that scope.
 *
 * Strategy:
 *  1. Define the abstract base in facebook::hermes::inspector (original namespace).
 *  2. Inject a using-declaration into inspector_modern::chrome so the bare
 *     name `RuntimeAdapter` resolves there, matching RN 0.85.x expectations.
 */
#pragma once

#include <hermes/hermes.h>
#include <jsi/jsi.h>

// ── 1. Define in original namespace ──────────────────────────────────────────
namespace facebook::hermes::inspector {

class RuntimeAdapter {
 public:
  virtual ~RuntimeAdapter() = default;
  virtual facebook::hermes::HermesRuntime &getRuntime() = 0;
  virtual void tickleJs() {}
};

} // namespace facebook::hermes::inspector

// ── 2. Make visible in inspector_modern::chrome (where Registration.h uses it)
namespace facebook::hermes::inspector_modern::chrome {

using RuntimeAdapter = ::facebook::hermes::inspector::RuntimeAdapter;

} // namespace facebook::hermes::inspector_modern::chrome

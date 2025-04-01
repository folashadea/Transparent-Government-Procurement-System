;; Vendor Registration Contract
;; This contract validates and registers qualified government suppliers

(define-data-var admin principal tx-sender)
(define-map vendors
  { vendor-id: (string-ascii 64) }
  {
    principal: principal,
    name: (string-ascii 256),
    registration-date: uint,
    is-active: bool,
    category: (string-ascii 64)
  }
)

(define-public (register-vendor (vendor-id (string-ascii 64)) (name (string-ascii 256)) (category (string-ascii 64)))
  (let
    ((vendor-data {
      principal: tx-sender,
      name: name,
      registration-date: block-height,
      is-active: true,
      category: category
    }))
    (begin
      (asserts! (is-none (map-get? vendors { vendor-id: vendor-id })) (err u1)) ;; Vendor ID already exists
      (ok (map-insert vendors { vendor-id: vendor-id } vendor-data))
    )
  )
)

(define-public (update-vendor-status (vendor-id (string-ascii 64)) (is-active bool))
  (let
    ((vendor-data (unwrap! (map-get? vendors { vendor-id: vendor-id }) (err u2)))) ;; Vendor not found
    (begin
      (asserts! (or (is-eq tx-sender (var-get admin)) (is-eq tx-sender (get principal vendor-data))) (err u3)) ;; Not authorized
      (ok (map-set vendors
        { vendor-id: vendor-id }
        (merge vendor-data { is-active: is-active })
      ))
    )
  )
)

(define-read-only (get-vendor (vendor-id (string-ascii 64)))
  (map-get? vendors { vendor-id: vendor-id })
)

(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u4)) ;; Not authorized
    (ok (var-set admin new-admin))
  )
)


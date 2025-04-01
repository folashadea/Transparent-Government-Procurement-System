;; Contract Fulfillment Contract
;; This contract tracks delivery against agreed terms

(define-data-var admin principal tx-sender)
(define-map contracts
  { contract-id: (string-ascii 64) }
  {
    tender-id: (string-ascii 64),
    vendor: principal,
    start-date: uint,
    end-date: uint,
    value: uint,
    status: (string-ascii 20) ;; "active", "completed", "terminated"
  }
)

(define-map milestones
  { contract-id: (string-ascii 64), milestone-id: uint }
  {
    description: (string-utf8 1024),
    due-date: uint,
    value: uint,
    status: (string-ascii 20), ;; "pending", "completed", "overdue"
    completion-date: (optional uint)
  }
)

(define-public (create-contract (contract-id (string-ascii 64)) (tender-id (string-ascii 64)) (vendor principal) (end-date uint) (value uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u1)) ;; Not authorized
    (asserts! (is-none (map-get? contracts { contract-id: contract-id })) (err u2)) ;; Contract ID already exists
    (asserts! (> end-date block-height) (err u3)) ;; End date must be in the future
    (ok (map-insert contracts
      { contract-id: contract-id }
      {
        tender-id: tender-id,
        vendor: vendor,
        start-date: block-height,
        end-date: end-date,
        value: value,
        status: "active"
      }
    ))
  )
)

(define-public (add-milestone (contract-id (string-ascii 64)) (milestone-id uint) (description (string-utf8 1024)) (due-date uint) (value uint))
  (let
    ((contract (unwrap! (map-get? contracts { contract-id: contract-id }) (err u4)))) ;; Contract not found
    (begin
      (asserts! (is-eq tx-sender (var-get admin)) (err u5)) ;; Not authorized
      (asserts! (is-eq (get status contract) "active") (err u6)) ;; Contract is not active
      (asserts! (is-none (map-get? milestones { contract-id: contract-id, milestone-id: milestone-id })) (err u7)) ;; Milestone ID already exists
      (asserts! (<= due-date (get end-date contract)) (err u8)) ;; Due date must be before contract end date
      (ok (map-insert milestones
        { contract-id: contract-id, milestone-id: milestone-id }
        {
          description: description,
          due-date: due-date,
          value: value,
          status: "pending",
          completion-date: none
        }
      ))
    )
  )
)

(define-public (complete-milestone (contract-id (string-ascii 64)) (milestone-id uint))
  (let
    ((contract (unwrap! (map-get? contracts { contract-id: contract-id }) (err u9))) ;; Contract not found
     (milestone (unwrap! (map-get? milestones { contract-id: contract-id, milestone-id: milestone-id }) (err u10)))) ;; Milestone not found
    (begin
      (asserts! (or (is-eq tx-sender (var-get admin)) (is-eq tx-sender (get vendor contract))) (err u11)) ;; Not authorized
      (asserts! (is-eq (get status contract) "active") (err u12)) ;; Contract is not active
      (asserts! (is-eq (get status milestone) "pending") (err u13)) ;; Milestone is not pending
      (ok (map-set milestones
        { contract-id: contract-id, milestone-id: milestone-id }
        (merge milestone {
          status: "completed",
          completion-date: (some block-height)
        })
      ))
    )
  )
)

(define-public (complete-contract (contract-id (string-ascii 64)))
  (let
    ((contract (unwrap! (map-get? contracts { contract-id: contract-id }) (err u14)))) ;; Contract not found
    (begin
      (asserts! (is-eq tx-sender (var-get admin)) (err u15)) ;; Not authorized
      (asserts! (is-eq (get status contract) "active") (err u16)) ;; Contract is not active
      (ok (map-set contracts
        { contract-id: contract-id }
        (merge contract { status: "completed" })
      ))
    )
  )
)

(define-read-only (get-contract (contract-id (string-ascii 64)))
  (map-get? contracts { contract-id: contract-id })
)

(define-read-only (get-milestone (contract-id (string-ascii 64)) (milestone-id uint))
  (map-get? milestones { contract-id: contract-id, milestone-id: milestone-id })
)


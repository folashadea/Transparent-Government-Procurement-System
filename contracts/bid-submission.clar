;; Bid Submission Contract
;; This contract securely records and seals proposal details

(define-data-var admin principal tx-sender)
(define-map tenders
  { tender-id: (string-ascii 64) }
  {
    title: (string-ascii 256),
    description: (string-utf8 1024),
    deadline: uint,
    is-active: bool,
    created-by: principal
  }
)

(define-map bids
  { tender-id: (string-ascii 64), bidder: principal }
  {
    bid-amount: uint,
    proposal-hash: (buff 32),
    submission-time: uint,
    status: (string-ascii 20) ;; "submitted", "evaluated", "accepted", "rejected"
  }
)

(define-public (create-tender (tender-id (string-ascii 64)) (title (string-ascii 256)) (description (string-utf8 1024)) (deadline uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u1)) ;; Not authorized
    (asserts! (is-none (map-get? tenders { tender-id: tender-id })) (err u2)) ;; Tender ID already exists
    (asserts! (> deadline block-height) (err u3)) ;; Deadline must be in the future
    (ok (map-insert tenders
      { tender-id: tender-id }
      {
        title: title,
        description: description,
        deadline: deadline,
        is-active: true,
        created-by: tx-sender
      }
    ))
  )
)

(define-public (submit-bid (tender-id (string-ascii 64)) (bid-amount uint) (proposal-hash (buff 32)))
  (let
    ((tender (unwrap! (map-get? tenders { tender-id: tender-id }) (err u4)))) ;; Tender not found
    (begin
      (asserts! (get is-active tender) (err u5)) ;; Tender is not active
      (asserts! (<= block-height (get deadline tender)) (err u6)) ;; Deadline has passed
      (asserts! (is-none (map-get? bids { tender-id: tender-id, bidder: tx-sender })) (err u7)) ;; Bid already submitted
      (ok (map-insert bids
        { tender-id: tender-id, bidder: tx-sender }
        {
          bid-amount: bid-amount,
          proposal-hash: proposal-hash,
          submission-time: block-height,
          status: "submitted"
        }
      ))
    )
  )
)

(define-read-only (get-tender (tender-id (string-ascii 64)))
  (map-get? tenders { tender-id: tender-id })
)

(define-read-only (get-bid (tender-id (string-ascii 64)) (bidder principal))
  (map-get? bids { tender-id: tender-id, bidder: bidder })
)

(define-public (close-tender (tender-id (string-ascii 64)))
  (let
    ((tender (unwrap! (map-get? tenders { tender-id: tender-id }) (err u8)))) ;; Tender not found
    (begin
      (asserts! (or (is-eq tx-sender (var-get admin)) (is-eq tx-sender (get created-by tender))) (err u9)) ;; Not authorized
      (ok (map-set tenders
        { tender-id: tender-id }
        (merge tender { is-active: false })
      ))
    )
  )
)


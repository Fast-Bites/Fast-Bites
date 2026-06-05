import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCardExpiry, savePaymentCard } from '../lib/paymentsApi';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import OverlayChoiceModal from '../components/OverlayChoiceModal';
import PaymentCardFields, { type PaymentCardFieldErrors } from '../components/PaymentCardFields';
import {
  PAYMENT_CARD_PLACEHOLDER_ERRORS,
  SHOW_PAYMENT_CARD_ERROR_PLACEHOLDERS,
} from '../constants/paymentCardErrors';
import { responsivePx } from '../constants/responsive';

const CARD_MODAL_ICON = '/assets/credit-card%201.svg';

/** Narrow panel + compact pill actions — Add Card modals only. */
const ADD_CARD_MODAL_PANEL = 'mx-4 w-full max-w-[17rem] px-8 !py-3';
const ADD_CARD_MODAL_ACTIONS = 'justify-between';
const ADD_CARD_MODAL_BUTTON = '!rounded-lg';

type AddCardModalStep = 'none' | 'save' | 'success';

function isCardFormValid(
  cardHolder: string,
  cardNumber: string,
  cardExpiry: string,
  cvv: string,
): boolean {
  return (
    cardHolder.trim().length > 0 &&
    cardNumber.replace(/\s/g, '').length >= 13 &&
    cardExpiry.trim().length >= 4 &&
    cvv.trim().length >= 3
  );
}

function buildPlaceholderErrors(
  cardHolder: string,
  cardNumber: string,
  cardExpiry: string,
  cvv: string,
): PaymentCardFieldErrors {
  const errors: PaymentCardFieldErrors = {};
  if (!cardHolder.trim()) errors.cardHolder = PAYMENT_CARD_PLACEHOLDER_ERRORS.cardHolder;
  if (cardNumber.replace(/\s/g, '').length < 13) {
    errors.cardNumber = PAYMENT_CARD_PLACEHOLDER_ERRORS.cardNumber;
  }
  if (cardExpiry.trim().length < 4) {
    errors.cardExpiry = PAYMENT_CARD_PLACEHOLDER_ERRORS.cardExpiry;
  }
  if (cvv.trim().length < 3) errors.cvv = PAYMENT_CARD_PLACEHOLDER_ERRORS.cvv;
  return errors;
}

const AddCard = () => {
  const navigate = useNavigate();
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [modalStep, setModalStep] = useState<AddCardModalStep>('none');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const valid = useMemo(
    () => isCardFormValid(cardHolder, cardNumber, cardExpiry, cvv),
    [cardHolder, cardNumber, cardExpiry, cvv],
  );

  const errors = useMemo((): PaymentCardFieldErrors | undefined => {
    if (SHOW_PAYMENT_CARD_ERROR_PLACEHOLDERS) {
      return { ...PAYMENT_CARD_PLACEHOLDER_ERRORS };
    }
    if (!showErrors) return undefined;
    return buildPlaceholderErrors(cardHolder, cardNumber, cardExpiry, cvv);
  }, [showErrors, cardHolder, cardNumber, cardExpiry, cvv]);

  const handleAddCard = () => {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    setModalStep('save');
  };

  const goToSuccessModal = async (saveDetails: boolean) => {
    const exp = parseCardExpiry(cardExpiry);
    if (!exp) {
      setSaveError('Enter a valid expiry (MM / YY).');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const result = await savePaymentCard({
      cardholder_name: cardHolder.trim(),
      card_number: cardNumber.replace(/\s/g, ''),
      exp_month: exp.exp_month,
      exp_year: exp.exp_year,
      save_details: saveDetails,
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? 'Could not save card. Sign in and try again.');
      return;
    }
    setModalStep('success');
  };

  const finishAndReturnToWallet = () => {
    setModalStep('none');
    navigate('/wallet');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-black font-[var(--font-poppins)] text-foreground">
      <div className={`${responsivePx} pt-10`}>
        <BackButton variant="map" to="/wallet" />
        <h1 className="mt-4 text-3xl font-semibold leading-tight">
          Add <span className="text-primary">new</span>
          <br />
          payment card
        </h1>
      </div>

      <div className={`flex flex-1 flex-col ${responsivePx} mt-10 pb-36`}>
        {saveError && (
          <p className="mb-4 text-sm text-red-400" role="alert">
            {saveError}
          </p>
        )}
        <PaymentCardFields
          cardHolder={cardHolder}
          cardNumber={cardNumber}
          cardExpiry={cardExpiry}
          cvv={cvv}
          onCardHolderChange={setCardHolder}
          onCardNumberChange={setCardNumber}
          onCardExpiryChange={setCardExpiry}
          onCvvChange={setCvv}
          errors={errors}
          errorsArePlaceholder={SHOW_PAYMENT_CARD_ERROR_PLACEHOLDERS}
        />
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-black ${responsivePx} pb-[max(1rem,env(safe-area-inset-bottom))] pt-3`}
      >
        <Button type="button" variant="primary" disabled={!valid} onClick={handleAddCard}>
          Add card
        </Button>
      </div>

      <OverlayChoiceModal
        open={modalStep === 'save'}
        onBackdropClick={() => setModalStep('none')}
        iconBadgeSrc={CARD_MODAL_ICON}
        title="Would you like to save your card details"
        titleClassName="text-sm font-normal leading-snug"
        panelClassName={ADD_CARD_MODAL_PANEL}
        actionsClassName={ADD_CARD_MODAL_ACTIONS}
        actionsStretch={false}
        actionButtonClassName={ADD_CARD_MODAL_BUTTON}
        actions={[
          { label: 'Yes', variant: 'primary', disabled: saving, onClick: () => goToSuccessModal(true) },
          { label: 'No', variant: 'outline-primary', disabled: saving, onClick: () => goToSuccessModal(false) },
        ]}
      />

      <OverlayChoiceModal
        open={modalStep === 'success'}
        iconBadgeSrc={CARD_MODAL_ICON}
        title="Your card has been added"
        titleClassName="text-sm font-normal"
        panelClassName={ADD_CARD_MODAL_PANEL}
        actionsLayout="column"
        actionsStretch={false}
        actionButtonClassName={ADD_CARD_MODAL_BUTTON}
        actions={[{ label: 'Okay', variant: 'primary', onClick: finishAndReturnToWallet }]}
      />
    </div>
  );
};

export default AddCard;

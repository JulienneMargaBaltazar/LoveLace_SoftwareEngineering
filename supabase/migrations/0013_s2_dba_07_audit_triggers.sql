-- S2-DBA-07: Bind audit_user() triggers to customer, product, and pricehist

DROP TRIGGER IF EXISTS customer_audit_aiud ON public.customer;
CREATE TRIGGER customer_audit_aiud
AFTER INSERT OR UPDATE OR DELETE ON public.customer
FOR EACH ROW EXECUTE FUNCTION public.audit_user();

DROP TRIGGER IF EXISTS product_audit_aiud ON public.product;
CREATE TRIGGER product_audit_aiud
AFTER INSERT OR UPDATE OR DELETE ON public.product
FOR EACH ROW EXECUTE FUNCTION public.audit_user();

DROP TRIGGER IF EXISTS pricehist_audit_aiud ON public.pricehist;
CREATE TRIGGER pricehist_audit_aiud
AFTER INSERT OR UPDATE OR DELETE ON public.pricehist
FOR EACH ROW EXECUTE FUNCTION public.audit_user();

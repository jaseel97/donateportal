from celery import shared_task

from api.models import Item

@shared_task
def make_inactive(item_id):
    """
    Celery task to make an item inactive after its available_till date passes
    if the item hasn't been reserved or picked up.
    """
    try:
        item = Item.objects.filter(
            id=item_id,
            is_active=True,
            is_picked_up=False,
        ).first()
        
        if item:
            Item.objects.filter(id=item_id).update(is_active=False)
            return True
            
        return False
        
    except Exception as e:
        print(f"Error in make_inactive task for item {item_id}: {str(e)}")
        return False